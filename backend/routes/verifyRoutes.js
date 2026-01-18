
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

// © 2025 Mia Lopez | CoinPurse™ Chain Verifier API
// 🔗 Integrates universal provider (v5 + v6) via loadEthers.js
// ✅ Returns live network status + transaction verification
// 🧾 Includes backend audit logging for downtime and uptime tracking
// 📂 backend/routes/verifyRoutes.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { verifyChain } = require("../services/verifyChain");
const { getProvider } = require("../utils/loadEthers");

// 🧠 Initialize shared provider once for health checks
const provider = getProvider();

// 🧾 Ensure logs directory exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logPath = path.join(logDir, "verifier-events.log");

// 📦 Utility to write audit events
function logVerifierEvent(status, message) {
    const entry = `${new Date().toISOString()} | ${status.toUpperCase()} | ${message}\n`;
    try {
        fs.appendFileSync(logPath, entry);
    } catch (err) {
        console.error("⚠️ Failed to write verifier log:", err.message);
    }
}

// ─────────────────────────────────────────────
// 🔍 POST /api/verify — Validate a transaction hash
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { txHash, chain } = req.body || {};
        const result = await verifyChain({ txHash, chain });
        logVerifierEvent(
            result.status === "success" ? "ok" : "fail",
            `Checked tx ${txHash} on ${chain || "polygon"} → ${result.status}`
        );
        res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error("💥 /api/verify POST error:", err.message);
        logVerifierEvent("error", `POST /verify failed: ${err.message}`);
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// ─────────────────────────────────────────────
// 🔧 GET /api/verify/status — Network & health probe
// ─────────────────────────────────────────────
router.get("/status", async (req, res) => {
    try {
        const network = await provider.getNetwork();
        const block = await provider.getBlockNumber();

        const payload = {
            ok: true,
            service: "Chain Verifier",
            version: "1.0.2",
            network: network.name,
            chainId: Number(network.chainId),
            latestBlock: block,
            provider: process.env.RPC_URL || "default",
            timestamp: new Date().toISOString(),
        };

        logVerifierEvent("ok", `Network healthy: ${network.name} @ block ${block}`);
        res.json(payload);
    } catch (err) {
        console.error("⚠️ /api/verify/status error:", err.message);
        logVerifierEvent("error", `/status failed: ${err.message}`);
        res.status(500).json({
            ok: false,
            error: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// ─────────────────────────────────────────────
// 🧾 GET /api/verify/history — Retrieve recent logs
// ─────────────────────────────────────────────
router.get("/history", (req, res) => {
    try {
        if (!fs.existsSync(logPath)) return res.json({ events: [] });
        const content = fs
            .readFileSync(logPath, "utf-8")
            .split("\n")
            .filter(Boolean)
            .slice(-50); // last 50 events
        res.json({ events: content });
    } catch (err) {
        console.error("⚠️ Failed to read verifier log history:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to read verifier log history",
            timestamp: new Date().toISOString(),
        });
    }
});

module.exports = router;
