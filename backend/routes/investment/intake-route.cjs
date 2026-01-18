/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * Proprietary and confidential.
 * Unauthorized use, copying, or modification is prohibited.
 */
console.log("🔥 ACTIVE INTAKE ROUTE — A6.3 ENABLED 🔥");

"use strict";

// ─────────────────────────────────────────────────────────────
// Imports
// ─────────────────────────────────────────────────────────────

const express = require("express");
const fs = require("fs");
const path = require("path");
const xrpl = require("xrpl");
const dotenv = require("dotenv");

const { signEnvelope, newNonce } =
    require("../../services/crypto/signing.cjs");

const {
    buildIdempotencyKey,
    stageIntake
} = require("../../services/intake/intakeQueue.cjs");

const {
    daoCommit
} = require("../../services/dao/daoClient.cjs");

const emfIntakeMetrics =
    require("../../middleware/emfIntakeMetrics.cjs");

const {
    logIntakeMetrics
} = require("../../../docs/observability/node_cloudwatch_emf_logger.js");

// A6.2.1 hash signing (must exist)
const { signGovernancePayload } =
    require("../../governance/hashSigner.cjs");

// A6.3 trustee escalation queue (must exist)
const { queueTrusteeEscalation } =
    require("../../trustee/queue/escalationQueue.cjs");

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

dotenv.config({ path: process.env.ENV_PATH || ".env.override" });

const router = express.Router();

// Vault paths (WSL-safe)
const vaultBase =
    process.env.VAULT_PATH ||
    "/mnt/c/Users/mialo/AGVault/investment/projects";

const queueDir =
    process.env.INTAKE_QUEUE_PATH ||
    "/mnt/c/Users/mialo/AGVault/investment/queue";

if (!fs.existsSync(vaultBase)) fs.mkdirSync(vaultBase, { recursive: true });
if (!fs.existsSync(queueDir)) fs.mkdirSync(queueDir, { recursive: true });

// XRPL (production only)
const client = new xrpl.Client(
    process.env.XRPL_WS || "wss://xrplcluster.com"
);

let xrplConnected = false;

async function connectXRPL() {
    if (process.env.MODLINK_DEMO_MODE === "true") return;
    if (xrplConnected) return;

    await client.connect();
    xrplConnected = true;
    console.log("✅ Connected to XRPL Ledger (Production)");
}

// Vault writer
function writeVault(category, data) {
    const file = `${category}-${Date.now()}.json`;
    const fullPath = path.join(vaultBase, file);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    return fullPath;
}

// A6.3 threshold rule
function requiresTrusteeEscalation(payload) {
    const amount = Number(payload.amount ?? 0);
    const THRESHOLD = Number(process.env.TRUSTEE_ESCALATION_THRESHOLD || 250000);
    return amount >= THRESHOLD;
}

// Observability wrapper
router.use(emfIntakeMetrics("intake-api"));

// ─────────────────────────────────────────────────────────────
// POST /api/investment/intake
// ─────────────────────────────────────────────────────────────

router.post("/intake", async (req, res) => {
    const payload = req.body || {};
    const xrpl_address = payload.xrpl_address || payload.xrplAddress;
    const { investor, project, amount, source } = payload;

    /* =====================================================
       🔒 A6.2 GOVERNANCE ENFORCEMENT — HARD STOP (AUTHORITATIVE)
       ===================================================== */

    const modlinkProof = req.headers["x-modlink-proof"];
    const modlinkMode = req.headers["x-modlink-mode"] || "live";

    if (!modlinkProof) {
        return res.status(403).json({
            error: "GOVERNANCE_DENIED",
            reason: "DENY_MISSING_MODLINK_PROOF"
        });
    }

    // Demo proof may NEVER be used in live mode
    if (modlinkMode === "live" && String(modlinkProof).startsWith("demo-")) {
        return res.status(403).json({
            error: "DEMO_PROOF_USED_IN_LIVE_MODE",
            governance: "A6.2_ENFORCED"
        });
    }

    // Attach governance context for downstream audit / A6.3
    req.governance = {
        modlinkProof,
        modlinkMode,
        enforcedAt: new Date().toISOString(),
        enforcementLayer: "A6.2",
        hash: signGovernancePayload({
            type: "INVESTMENT_INTAKE",
            xrpl_address,
            amount,
            investor,
            project,
            source,
            proof: modlinkProof,
            mode: modlinkMode
        })
    };

    try {
        // 1️⃣ Basic validation
        if (!xrpl_address) {
            return res.status(400).json({
                ok: false,
                error: "Missing XRPL address"
            });
        }

        if (amount === undefined || amount === null) {
            return res.status(400).json({
                ok: false,
                error: "Missing investment amount"
            });
        }

        // 2️⃣ XRPL validation
        if (process.env.MODLINK_DEMO_MODE === "true") {
            const classicRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
            if (!classicRegex.test(xrpl_address)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid XRPL Classic address (demo mode)"
                });
            }
        } else {
            await connectXRPL();
            if (!xrpl.isValidAddress(xrpl_address)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid XRPL address"
                });
            }
        }

        // 3️⃣ Persist authoritative snapshot
        const vaultFile = writeVault("intake", {
            timestamp: new Date().toISOString(),
            investor,
            project,
            amount,
            xrpl_address,
            source,
            demo: process.env.MODLINK_DEMO_MODE === "true",
            governance: req.governance
        });

        // 4️⃣ Idempotency
        const idempotencyKey = buildIdempotencyKey(req, payload);

        // 5️⃣ Stage intake
        const staged = stageIntake({
            queueDir,
            payload: { investor, project, amount, xrpl_address, source, governance: req.governance },
            idempotencyKey
        });

        // 6️⃣ Metrics
        logIntakeMetrics(
            { service: "intake-api", env: process.env.NODE_ENV || "prod" },
            { IntakeSubmissions: 1 }
        );

        /* =====================================================
           🏛️ A6.3 TRUSTEE ESCALATION — MUST RUN BEFORE DEMO RETURN
           ===================================================== */

        if (requiresTrusteeEscalation(payload)) {
            const esc = await queueTrusteeEscalation({
                project: {
                    projectId: (project && project.projectId) ? project.projectId : (payload.projectId || "UNKNOWN"),
                    investor,
                    project,
                    amount,
                    xrpl_address,
                    source
                },
                governance: req.governance,
                idempotencyKey,
                vaultFile,
                stagedFile: staged.stagedFile
            });

            return res.status(202).json({
                ok: true,
                staged: true,
                status: "ESCALATED",
                duplicate: staged.duplicate,
                idempotencyKey,
                escalationId: esc.id,
                escalationHash: esc.hash,
                stagedFile: staged.stagedFile,
                vaultFile,
                message: "Intake escalated — trustee approval required before execution"
            });
        }

        // 7️⃣ DEMO MODE → stage only (AFTER escalation check)
        if (process.env.MODLINK_DEMO_MODE === "true") {
            return res.status(202).json({
                ok: true,
                staged: true,
                duplicate: staged.duplicate,
                idempotencyKey,
                event: "DAO_COMMIT_REQUESTED",
                stagedFile: staged.stagedFile,
                vaultFile,
                message: "Intake accepted (DEMO — staged only)"
            });
        }

        // 8️⃣ PROD commit gate
        if (process.env.DAO_COMMIT_ENABLED !== "true") {
            return res.status(202).json({
                ok: true,
                staged: true,
                duplicate: staged.duplicate,
                idempotencyKey,
                event: "DAO_COMMIT_REQUESTED",
                stagedFile: staged.stagedFile,
                vaultFile,
                message: "Intake accepted (PROD — commit disabled)"
            });
        }

        // 9️⃣ DAO commit (signed + nonce)
        const envelope = {
            type: "DAO_COMMIT_REQUESTED",
            version: "1.0",
            ts: new Date().toISOString(),
            nonce: newNonce(),
            idempotencyKey,
            governance: req.governance,
            payload: { investor, project, amount, xrpl_address, source }
        };

        const privPath = process.env.DAO_COMMIT_PRIV_PEM;
        if (!privPath) throw new Error("Missing DAO_COMMIT_PRIV_PEM");

        const privPem = fs.readFileSync(privPath, "utf8");
        const signature = signEnvelope(envelope, privPem);

        const daoResp = await daoCommit({
            envelope: { ...envelope, signature },
            commitUrl: process.env.DAO_COMMIT_URL,
            apiKey: process.env.DAO_API_KEY
        });

        return res.status(200).json({
            ok: true,
            staged: true,
            committed: true,
            idempotencyKey,
            stagedFile: staged.stagedFile,
            vaultFile,
            dao: daoResp
        });

    } catch (err) {
        console.error("❌ INTAKE ERROR:", err);
        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
});

// ─────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────

router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        xrplConnected,
        demo: process.env.MODLINK_DEMO_MODE === "true",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
