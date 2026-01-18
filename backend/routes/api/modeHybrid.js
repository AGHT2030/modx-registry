
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

// © 2025 Mia Lopez | MODE Hybrid Router
// 🎬 Synchronizes MODE hybrid operations with AIRS, CREATV, and MODA Stay layers.
// Updated: Integrated centralized alertHooks for Slack/Nodemailer + rate limiting.

const express = require("express");
const router = express.Router();
const { safeRequire } = require("../../middleware/globalMiddlewareLoader");
const { checkHealthAndAlert } = require("../../middleware/alertHooks");

// -------------------------------------------------------------
// 🧩 Safe import of MODE Session Handler
// -------------------------------------------------------------
let handler = safeRequire("../../middleware/modeSessionHandler");
const isHealthy = !!handler;
if (!isHealthy) {
    console.warn("⚠️ modeSessionHandler not found — fallback active.");
    handler = {};
}

// Trigger central alert if missing
checkHealthAndAlert("MODE Hybrid", isHealthy, "Session handler missing — fallback active");

// -------------------------------------------------------------
// ✅ Safe function fallbacks
// -------------------------------------------------------------
const startSession = handler.startSession || ((req, res, next) => {
    req.modeSession = { id: Date.now(), module: "MODE", fallback: true };
    console.log("⚠️ MODE fallback startSession executed.");
    next();
});

const validateSession = handler.validateSession || ((req, res, next) => {
    req.modeSession = req.modeSession || { id: Date.now(), validated: true };
    console.log("⚠️ MODE fallback validateSession executed.");
    next();
});

const endSession = handler.endSession || ((req, res, next) => {
    req.modeSession = null;
    console.log("⚠️ MODE fallback endSession executed.");
    next();
});

console.log("🧩 MODE Hybrid Router initialized safely.");

// -------------------------------------------------------------
// 🩺 Health
// -------------------------------------------------------------
router.get("/health", (req, res) => {
    const healthy = !!handler.startSession;
    if (!healthy) checkHealthAndAlert("MODE Hybrid", false, "Degraded — fallback active");

    res.json({
        service: "MODE Hybrid",
        status: healthy ? "online" : "degraded",
        integrations: ["AIRS", "CREATV", "MODA Stay"],
        timestamp: new Date().toISOString(),
    });
});

// -------------------------------------------------------------
// 🚀 Routes
// -------------------------------------------------------------
router.post("/session/start", startSession, (req, res) => {
    res.json({
        success: true,
        session: req.modeSession,
        message: "MODE session started.",
    });
});

router.post("/session/validate", validateSession, (req, res) => {
    res.json({
        success: true,
        validated: !!req.modeSession,
        message: "MODE session validated.",
    });
});

router.post("/session/end", endSession, (req, res) => {
    res.json({
        success: true,
        message: "MODE session ended.",
    });
});

// -------------------------------------------------------------
// 🧭 Status Summary (for PM2 dashboards & hybrid monitoring)
// -------------------------------------------------------------
router.get("/status", (req, res) => {
    res.json({
        module: "modeHybrid",
        status: isHealthy ? "active" : "degraded",
        mode: handler.startSession ? "handler" : "fallback",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
