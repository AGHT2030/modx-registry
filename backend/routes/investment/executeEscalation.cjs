/**
 * A6.3 / A6.4 — Execute Escalated Intake After Trustee Approval
 * Execution is permitted ONLY after trustee APPROVE.
 * DEMO execution records immutable receipt; LIVE executes XRPL.
 */

"use strict";

const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const { buildXRPLContract } =
    require("../../contracts/contractBuilder.cjs");
const { notifyFidelityContractDeployment } =
    require("../../contracts/fidelityNotifier.cjs");
const { logEvent } =
    require("../../hooks/useLogger.cjs");

const { assertApproved } =
    require("../../trustee/queue/decisionCheck.cjs");

/* =====================================================
   🔒 A6.2 GOVERNANCE HARD STOP (REUSED)
   ===================================================== */
function governanceHardStop(req, res, next) {
    const modlinkProof = req.headers["x-modlink-proof"];
    const modlinkMode = (req.headers["x-modlink-mode"] || "live").toLowerCase();

    if (!modlinkProof) {
        return res.status(403).json({
            error: "GOVERNANCE_DENIED",
            reason: "DENY_MISSING_MODLINK_PROOF"
        });
    }

    if (modlinkMode === "live" && modlinkProof.startsWith("demo-")) {
        return res.status(403).json({
            error: "DEMO_PROOF_USED_IN_LIVE_MODE",
            governance: "A6.2_ENFORCED"
        });
    }

    req.governance = {
        modlinkProof,
        modlinkMode,
        enforcedAt: new Date().toISOString(),
        enforcementLayer: "A6.2"
    };

    next();
}

/**
 * POST /api/investment/escalations/execute
 * Body: { escalationId: "ESC-..." }
 */
router.post("/api/investment/escalations/execute", governanceHardStop, async (req, res) => {
    try {
        const { escalationId } = req.body || {};
        if (!escalationId) {
            return res.status(400).json({ ok: false, error: "MISSING_ESCALATION_ID" });
        }

        // ✅ Trustee approval verification (authoritative)
        const approval = assertApproved(escalationId);
        if (!approval.ok) {
            return res.status(approval.status).json({
                ok: false,
                error: approval.error
            });
        }

        const { escalation, decision } = approval;
        const project = escalation.payload;

        if (!project || !project.projectId) {
            return res.status(409).json({
                ok: false,
                error: "ESCALATION_PAYLOAD_INVALID"
            });
        }

        /* =====================================================
           A6.4 — DEMO EXECUTION ADAPTER (NO XRPL / NO DAO)
           ===================================================== */
        if (req.governance.modlinkMode === "demo" || process.env.MODLINK_DEMO_MODE === "true") {
            const execDir =
                process.env.EXECUTION_VAULT_PATH ||
                "/mnt/c/Users/mialo/AGVault/investment/executions";

            if (!fs.existsSync(execDir)) fs.mkdirSync(execDir, { recursive: true });

            const receipt = {
                ok: true,
                executed: true,
                mode: "DEMO",
                escalationId,
                projectId: project.projectId,
                executedAt: new Date().toISOString(),
                note: "Demo execution recorded — XRPL and DAO execution intentionally skipped",
                governance: req.governance,
                trusteeDecision: {
                    trusteeId: decision.trusteeId,
                    signature: decision.signature
                }
            };

            const receiptFile = path.join(
                execDir,
                `exec-demo-${Date.now()}-${String(escalationId).replace(/[^a-zA-Z0-9_-]/g, "")}.json`
            );

            fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2));

            logEvent("info", "Escalation executed in DEMO mode", {
                escalationId,
                projectId: project.projectId
            });

            return res.status(202).json({
                ok: true,
                executed: true,
                mode: "DEMO",
                escalationId,
                receiptFile,
                message: "Escalation executed (DEMO) — receipt recorded"
            });
        }

        /* =====================================================
           🚀 LIVE EXECUTION — XRPL
           ===================================================== */
        const xrplRes = await buildXRPLContract({
            projectId: project.projectId,
            issuerSeed: process.env.XRPL_ISSUER_SEED
        });

        await notifyFidelityContractDeployment({
            projectId: project.projectId,
            chain: "XRPL-testnet",
            contractAddress: xrplRes.address,
            txId: xrplRes.txId,
            artifactPath: xrplRes.artifactPath,
            issuer: xrplRes.issuer,
            governance: req.governance,
            trusteeDecision: {
                escalationId,
                trusteeId: decision.trusteeId,
                signature: decision.signature
            }
        });

        logEvent("success", "Escalation executed after trustee approval", {
            escalationId,
            projectId: project.projectId,
            trusteeId: decision.trusteeId
        });

        return res.json({
            ok: true,
            executed: true,
            escalationId,
            projectId: project.projectId,
            xrpl: xrplRes,
            trustee: {
                decision: "APPROVE",
                trusteeId: decision.trusteeId,
                signature: decision.signature
            }
        });

    } catch (err) {
        logEvent("error", "Escalation execute failure", {
            message: err.message
        });
        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
});

module.exports = router;
