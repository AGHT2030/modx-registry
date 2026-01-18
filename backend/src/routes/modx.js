
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

// © 2025 AIMAL Global Holdings | MODX Core Route
// Handles system health, token data, and ecosystem metadata for MODX platform.

const express = require("express");
const router = express.Router();
const logger = require("../../logger");

// 🔹 GET /api/modx/ping — quick status
router.get("/ping", (_req, res) => {
    res.json({ status: "ok", message: "MODX core route active" });
});

// 🔹 GET /api/modx/info — platform metadata
router.get("/info", async (_req, res) => {
    try {
        res.json({
            project: "MODX",
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development",
            chain: process.env.NETWORK || "Polygon",
            endpoints: [
                "/api/modx/ping",
                "/api/modx/info",
                "/api/modx/status",
            ],
        });
    } catch (err) {
        logger.error("❌ Failed to load MODX info:", err);
        res.status(500).json({ error: "Internal error" });
    }
});

// 🔹 GET /api/modx/status — example runtime check
router.get("/status", (_req, res) => {
    res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node: process.version,
        time: new Date().toISOString(),
    });
});

module.exports = router;
