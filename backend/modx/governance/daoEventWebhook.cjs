
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

// © 2025 AIMAL Global Holdings | DAO Event Webhook + Business Pulse Sync
// ----------------------------------------------------------------------
// Links on-chain governance (PulseNFT) with Outlier Sentinel, AURA Twins,
// and Business Pulse dashboards. Handles:
//   • Signature verification
//   • Queue updates after DAO finalization
//   • PulseNFT smart contract state sync
//   • Real-time broadcasts to CoinPurse dashboards
//   • Optional email alerts
// ----------------------------------------------------------------------

const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { ethers } = require("ethers");
const router = express.Router();

const QUEUE_PATH = path.resolve("./backend/modx/governance/logs/admin_review_queue.json");
const SECRET = process.env.DAO_WEBHOOK_SECRET;
const PULSE_CONTRACT = process.env.PULSE_CONTRACT_ADDRESS;
const PROVIDER_URL = process.env.PROVIDER_URL || "https://polygon-rpc.com";
const PRIVATE_KEY = process.env.DAO_SIGNER_KEY; // admin key for updating local syncs

// Load ABI (from compiled artifacts)
let ABI = [];
try {
    ABI = JSON.parse(fs.readFileSync("./artifacts/contracts/PulseNFT.sol/PulseNFT.json", "utf8")).abi;
} catch {
    console.warn("⚠️ PulseNFT ABI not found — skipping contract sync");
}

// ----------------------------------------------------------------------
// 🔐 Verify webhook signature
// ----------------------------------------------------------------------
function verifySignature(req) {
    const sig = req.headers["x-dao-signature"];
    const hash = crypto.createHmac("sha256", SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");
    return sig === hash;
}

// ----------------------------------------------------------------------
// 💾 Update local governance queue + PulseNFT sync
// ----------------------------------------------------------------------
router.post("/", express.json(), async (req, res) => {
    try {
        if (!verifySignature(req)) return res.status(401).send("Invalid signature");

        const { event, proposalId, ruleId, status, reason } = req.body;
        const queue = fs.existsSync(QUEUE_PATH)
            ? JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"))
            : [];

        const idx = queue.findIndex((x) => x.proposalId === proposalId || x.rule?.id === ruleId);
        if (idx >= 0) {
            queue[idx].status = status || event.toLowerCase();
            queue[idx].finalizedAt = new Date().toISOString();
            queue[idx].reason = reason || "DAO event finalized";
        } else {
            queue.push({
                id: ruleId || crypto.randomUUID(),
                proposalId,
                status: status || "finalized",
                finalizedAt: new Date().toISOString(),
                reason: reason || "DAO-triggered rule",
            });
        }

        fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
        fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));

        // ------------------------------------------------------------------
        // 🧱 PulseNFT Smart Contract sync
        // ------------------------------------------------------------------
        if (ABI.length && PULSE_CONTRACT && PRIVATE_KEY) {
            try {
                const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
                const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
                const contract = new ethers.Contract(PULSE_CONTRACT, ABI, wallet);
                const tx = await contract.finalizeRule(
                    ethers.id(ruleId || proposalId),
                    status?.toLowerCase() === "approved",
                    reason || "DAO finalization event"
                );
                console.log(`🔗 PulseNFT Sync TX: ${tx.hash}`);
            } catch (err) {
                console.warn("⚠️ PulseNFT sync failed:", err.message);
            }
        }

        // ------------------------------------------------------------------
        // 📡 Outlier Sentinel + Dashboard Broadcast
        // ------------------------------------------------------------------
        const payload = { event, proposalId, ruleId, status, reason, timestamp: Date.now() };

        if (global.auraIO) {
            global.auraIO.emit("modx:policy:finalized", payload);
            global.auraIO.emit("business:pulse:update", payload);
        }

        // Sentinel hook (used for outlier impact detection)
        try {
            if (global.OutlierSentinel) {
                global.OutlierSentinel.recordEvent({
                    ruleId,
                    status,
                    severity: status === "approved" ? "low" : "critical",
                    source: "DAO Webhook",
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.warn("⚠️ Sentinel log failed:", err.message);
        }

        // ------------------------------------------------------------------
        // 📧 Optional email admin alert
        // ------------------------------------------------------------------
        if (process.env.MAIL_ALERTS === "true" && global.sendMail) {
            await global.sendMail({
                subject: `Policy ${status || "finalized"}: ${ruleId}`,
                text: `DAO finalized ${event} for rule ${ruleId}. Reason: ${reason || "none provided"}.`,
            });
        }

        console.log(`✅ DAO Event Processed: ${event} | Rule: ${ruleId} | Status: ${status}`);
        res.json({ ok: true, updated: ruleId, status });
    } catch (err) {
        console.error("❌ DAO Webhook Error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
