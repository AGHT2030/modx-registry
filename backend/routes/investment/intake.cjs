/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

// © 2025 AIMAL Global Holdings | Investment Intake Route
// Auto-chain: VaultWriter → DAO Logger → Fidelity Notifier → Contract Builder → XRPL Sync

const express = require("express");
const router = express.Router();

const { writeProjectToVault } = require("../../contracts/vaultWriter.cjs");
const { recordDaoEvent } = require("../../contracts/daoLogger.cjs");
const {
    notifyFidelityProjectIntake,
    notifyFidelityContractDeployment
} = require("../../contracts/fidelityNotifier.cjs");
const { buildXRPLContract } = require("../../contracts/contractBuilder.cjs");
const { logEvent } = require("../../hooks/useLogger.cjs");

const { queueTrusteeEscalation } = require("../../trustee/queue/escalationQueue.cjs");
const { signGovernancePayload } = require("../../governance/hashSigner.cjs");

function requiresTrusteeEscalation(project) {
    const amount = Number(project.amount || project.targetRaiseUSD || 0);
    const THRESHOLD = Number(process.env.TRUSTEE_ESCALATION_THRESHOLD || 250000);
    return amount >= THRESHOLD;
}

router.post("/intake", async (req, res) => {

    /* =====================================================
       🔒 A6.2 GOVERNANCE ENFORCEMENT — HARD STOP
       ===================================================== */

    const modlinkProof = req.headers["x-modlink-proof"];
    const modlinkMode = req.headers["x-modlink-mode"] || "live";

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

    try {
        const project = req.body;
        if (!project.projectId) {
            throw new Error("Missing projectId");
        }

        /* =====================================================
           🧾 GOVERNANCE CONTEXT + HASH (A6.2.1)
           ===================================================== */

        req.governance = {
            modlinkProof,
            modlinkMode,
            enforcedAt: new Date().toISOString(),
            enforcementLayer: "A6.2",
            hash: signGovernancePayload({
                projectId: project.projectId,
                payload: project,
                proof: modlinkProof,
                mode: modlinkMode
            })
        };

        /* =====================================================
           🧾 LEGACY INTAKE PIPELINE
           ===================================================== */

        // 1️⃣ Save in Vault
        const vaultRes = await writeProjectToVault(project);

        // 2️⃣ Record DAO Event
        await recordDaoEvent("project_intake", {
            projectId: project.projectId,
            hash: vaultRes.hash,
            filePath: vaultRes.filePath,
            governance: req.governance
        });

        // 3️⃣ Notify Fidelity Custodian
        await notifyFidelityProjectIntake({
            projectId: project.projectId,
            filePath: vaultRes.filePath,
            hash: vaultRes.hash,
            region: project.region,
            category: project.category,
            targetRaiseUSD: project.targetRaiseUSD,
            createdBy: project.createdBy,
            governance: req.governance
        });

        /* =====================================================
           🏛️ A6.3 TRUSTEE ESCALATION — MUST RUN BEFORE DEMO
           ===================================================== */

        if (requiresTrusteeEscalation(project)) {
            const esc = await queueTrusteeEscalation({
                project,
                governance: req.governance
            });

            logEvent("warn", "Intake escalated to trustee queue", {
                projectId: project.projectId,
                escalationId: esc.id,
                hash: esc.hash
            });

            return res.status(202).json({
                ok: true,
                staged: true,
                status: "ESCALATED",
                escalationId: esc.id,
                escalationHash: esc.hash,
                message: "Intake escalated — trustee approval required before execution"
            });
        }

        /* =====================================================
           🧪 DEMO MODE — STAGE ONLY (AFTER ESCALATION)
           ===================================================== */

        if (modlinkMode === "demo") {
            return res.status(202).json({
                ok: true,
                staged: true,
                message: "Intake accepted (DEMO — staged only)"
            });
        }

        /* =====================================================
           🚀 LIVE EXECUTION
           ===================================================== */

        // 4️⃣ Deploy XRPL Smart Contract
        const xrplRes = await buildXRPLContract({
            projectId: project.projectId,
            issuerSeed: process.env.XRPL_ISSUER_SEED
        });

        // 5️⃣ Notify Fidelity of Contract Deployment
        await notifyFidelityContractDeployment({
            projectId: project.projectId,
            chain: "XRPL-testnet",
            contractAddress: xrplRes.address,
            txId: xrplRes.txId,
            artifactPath: xrplRes.artifactPath,
            issuer: xrplRes.issuer,
            governance: req.governance
        });

        logEvent("success", "Full intake chain complete", {
            projectId: project.projectId,
            governance: req.governance
        });

        return res.json({
            success: true,
            projectId: project.projectId,
            xrpl: xrplRes,
            governance: req.governance
        });

    } catch (err) {
        logEvent("error", "Intake route failure", {
            message: err.message,
            governance: req.governance || null
        });

        return res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;
