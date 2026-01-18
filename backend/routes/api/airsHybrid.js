
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

// © 2025 Mia Lopez | AIRS Hybrid Router
// 🛰️ Connects AIRS Concierge, MODE, MODA Stay, and CREATV systems for unified guest services.
// Updated: Integrated centralized alertHooks (Slack/Nodemailer) and unified health logic.

const express = require("express");
const router = express.Router();
const { safeRequire } = require("../../middleware/globalMiddlewareLoader");
const { checkHealthAndAlert } = require("../../middleware/alertHooks");

// -------------------------------------------------------------
// 🧩 Safe import of session-related middleware
// -------------------------------------------------------------
let sessionHandler = safeRequire("../../middleware/modeSessionHandler");
const isHealthy = !!sessionHandler;
if (!isHealthy) {
    console.warn("⚠️ modeSessionHandler not found – creating fallback.");
    sessionHandler = {};
}

// 🔔 Central alert system call
checkHealthAndAlert("AIRS Hybrid", isHealthy, "modeSessionHandler missing — fallback active");

// -------------------------------------------------------------
// ✅ Safe fallbacks for session operations
// -------------------------------------------------------------
const startSession = sessionHandler.startSession || ((req, res, next) => {
    console.log("⚠️ Fallback: startSession not implemented.");
    req.modeSession = { id: Date.now(), module: "AIRS", fallback: true };
    next();
});

const validateSession = sessionHandler.validateSession || ((req, res, next) => {
    console.log("⚠️ Fallback: validateSession not implemented.");
    req.modeSession = req.modeSession || { id: Date.now(), validated: true };
    next();
});

const endSession = sessionHandler.endSession || ((req, res, next) => {
    console.log("⚠️ Fallback: endSession not implemented.");
    req.modeSession = null;
    next();
});

// -------------------------------------------------------------
// 🧩 Optional dependent hybrid middlewares
// -------------------------------------------------------------
const mode = safeRequire("../../routes/api/modeHybrid") || {};
const creatv = safeRequire("../../routes/api/creatvHybrid") || {};
const modaStay = safeRequire("../../routes/api/modaStayHybrid") || {};

console.log("🧩 AIRS Hybrid Router initialized safely.");

// -------------------------------------------------------------
// 🩺 Health Endpoint
// -------------------------------------------------------------
router.get("/health", (req, res) => {
    const healthy = !!sessionHandler.startSession;
    if (!healthy) checkHealthAndAlert("AIRS Hybrid", false, "Degraded — fallback mode active");

    res.json({
        service: "AIRS Hybrid",
        module: "airsHybrid",
        status: healthy ? "online" : "degraded",
        dependencies: {
            mode: !!mode.router,
            creatv: !!creatv.router,
            modaStay: !!modaStay.router,
        },
        timestamp: new Date().toISOString(),
    });
});

// -------------------------------------------------------------
// 🚀 Start Session
// -------------------------------------------------------------
router.post("/session/start", startSession, (req, res) => {
    res.json({
        success: true,
        session: req.modeSession,
        message: "AIRS session started (hybrid layer)",
    });
});

// -------------------------------------------------------------
// 🔍 Validate Session
// -------------------------------------------------------------
router.post("/session/validate", validateSession, (req, res) => {
    res.json({
        success: true,
        session: req.modeSession,
        message: "AIRS session validated (hybrid layer)",
    });
});

// -------------------------------------------------------------
// 🏁 End Session
// -------------------------------------------------------------
router.post("/session/end", endSession, (req, res) => {
    res.json({
        success: true,
        message: "AIRS session ended (hybrid layer)",
    });
});

// -------------------------------------------------------------
// 🧭 Status Summary (for PM2 or PowerShell probes)
// -------------------------------------------------------------
router.get("/status", (req, res) => {
    res.json({
        module: "airsHybrid",
        status: isHealthy ? "active" : "degraded",
        mode: sessionHandler.startSession ? "handler" : "fallback",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
