
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

// © 2025 Mia Lopez | CREATV Hybrid Router
// 📺 Handles synchronization of CREATV sessions and AIRS / MODE / MODA Stay links.
// Updated: integrated centralized alertHooks (Slack/Nodemailer ready) + unified health structure.

const express = require("express");
const router = express.Router();
const { safeRequire } = require("../../middleware/globalMiddlewareLoader");
const { checkHealthAndAlert } = require("../../middleware/alertHooks");

// -------------------------------------------------------------
// 🧩 Safe import of CREATV Session Sync
// -------------------------------------------------------------
let handler = safeRequire("../../middleware/creatvSessionSync");
const isHealthy = !!handler;
if (!isHealthy) {
    console.warn("⚠️ creatvSessionSync not found — fallback active.");
    handler = {};
}

// 🔔 Central alert trigger
checkHealthAndAlert("CREATV Hybrid", isHealthy, "Session sync missing — fallback active");

// -------------------------------------------------------------
// ✅ Safe function fallbacks
// -------------------------------------------------------------
const syncCreatvSessions =
    handler.syncCreatvSessions ||
    ((req, res, next) => {
        req.creatvSession = { id: Date.now(), module: "CREATV", fallback: true };
        console.log("⚠️ Fallback syncCreatvSessions executed.");
        next();
    });

const validateCreatv =
    handler.validateCreatv ||
    ((req, res, next) => {
        req.creatvSession = req.creatvSession || { id: Date.now(), validated: true };
        console.log("⚠️ Fallback validateCreatv executed.");
        next();
    });

const endCreatvSession =
    handler.endCreatvSession ||
    ((req, res, next) => {
        req.creatvSession = null;
        console.log("⚠️ Fallback endCreatvSession executed.");
        next();
    });

console.log("🧩 CREATV Hybrid Router initialized safely.");

// -------------------------------------------------------------
// 🩺 Health Endpoint
// -------------------------------------------------------------
router.get("/health", (req, res) => {
    const healthy = !!handler.syncCreatvSessions;
    if (!healthy) checkHealthAndAlert("CREATV Hybrid", false, "Degraded — fallback active");

    res.json({
        service: "CREATV Hybrid",
        module: "creatvHybrid",
        status: healthy ? "online" : "degraded",
        integrations: ["AIRS", "MODE", "MODA Stay"],
        timestamp: new Date().toISOString(),
    });
});

// -------------------------------------------------------------
// 🚀 Routes
// -------------------------------------------------------------
router.post("/sync", syncCreatvSessions, (req, res) => {
    res.json({
        success: true,
        session: req.creatvSession,
        message: "CREATV session synced (hybrid layer).",
    });
});

router.post("/validate", validateCreatv, (req, res) => {
    res.json({
        success: true,
        validated: !!req.creatvSession,
        message: "CREATV session validated (hybrid layer).",
    });
});

router.post("/end", endCreatvSession, (req, res) => {
    res.json({
        success: true,
        message: "CREATV session ended (hybrid layer).",
    });
});

// -------------------------------------------------------------
// 🧭 Status Summary (for PM2 dashboards & PowerShell probes)
// -------------------------------------------------------------
router.get("/status", (req, res) => {
    res.json({
        module: "creatvHybrid",
        status: isHealthy ? "active" : "degraded",
        mode: handler.syncCreatvSessions ? "handler" : "fallback",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
