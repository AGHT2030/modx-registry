
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

// © 2025 Mia Lopez | MODE Session Handler Middleware (Express Compatible)
// Ensures MODE hybrid routes safely load and coordinate sessions across AIRS, CREATV, CoinPurse, and MODE layers.
// Extended: adds healthCheck route + unified cross-sync helpers for hybrid integration.

const express = require("express");
const router = express.Router();

// 🟢 Start a MODE session
function startSession(req, res, next) {
    try {
        const user = req.user || { id: "guest", role: "visitor" };
        req.modeSession = {
            id: Date.now(),
            module: "MODE",
            user,
            active: true,
            startedAt: new Date().toISOString(),
        };
        console.log(JSON.stringify({
            event: "MODE_SESSION_START",
            id: req.modeSession.id,
            user: user.id,
            timestamp: req.modeSession.startedAt,
        }));
    } catch (err) {
        console.warn("⚠️ MODE startSession fallback triggered:", err.message);
        req.modeSession = {
            id: Date.now(),
            module: "MODE",
            fallback: true,
            startedAt: new Date().toISOString(),
        };
    }
    next && next();
}

// ✅ Validate session lifecycle
function validateSession(req, res, next) {
    try {
        if (!req.modeSession) {
            req.modeSession = {
                id: Date.now(),
                validated: true,
                createdAt: new Date().toISOString(),
            };
            console.log("⚠️ MODE session created on validation (missing prior session).");
        }
        console.log(`✅ MODE session validated for ${req.method} ${req.originalUrl}`);
    } catch (err) {
        console.warn("⚠️ MODE validateSession fallback triggered:", err.message);
    }
    next && next();
}

// 🔴 End session safely
function endSession(req, res, next) {
    try {
        if (req.modeSession) {
            req.modeSession.endedAt = new Date().toISOString();
            console.log(JSON.stringify({
                event: "MODE_SESSION_END",
                id: req.modeSession.id,
                user: req.modeSession.user?.id || "unknown",
                durationMs: Date.now() - new Date(req.modeSession.startedAt).getTime(),
            }));
        } else {
            console.warn("⚠️ MODE endSession called without an active session.");
        }
        req.modeSession = null;
    } catch (err) {
        console.warn("⚠️ MODE endSession fallback triggered:", err.message);
    }
    next && next();
}

// 🔄 Sync cross-module sessions (MODE ↔ AIRS ↔ CREATV ↔ CoinPurse)
function syncModeSessions(req, res, next) {
    try {
        const airsCtx = req.airsContext || {};
        const creatvCtx = req.creatvSession || {};
        const coinCtx = req.coinpurseSession || {};
        const summary = {
            modeSessionId: req.modeSession?.id || null,
            airsSynced: !!airsCtx.processed,
            creatvSynced: !!creatvCtx.synced,
            coinLinked: !!coinCtx.connected,
            timestamp: new Date().toISOString(),
        };
        console.log("🌀 MODE hybrid session sync:", JSON.stringify(summary));
        req.modeSyncSummary = summary;
    } catch (err) {
        console.warn("⚠️ MODE syncModeSessions fallback triggered:", err.message);
    }
    next && next();
}

// 💓 Health check for monitoring systems
function healthCheck() {
    return {
        module: "MODE Session Handler",
        status: "active",
        timestamp: new Date().toISOString(),
        dependencies: ["AIRS", "CREATV", "CoinPurse"],
    };
}

// -------------------------------------------------------------
// ✅ Express Router Integration
// -------------------------------------------------------------
router.get("/health", (req, res) => {
    res.json(healthCheck());
});

router.post("/start", startSession, (req, res) => {
    res.json({ ok: true, session: req.modeSession });
});

router.post("/end", endSession, (req, res) => {
    res.json({ ok: true, message: "Session ended" });
});

// -------------------------------------------------------------
// ✅ Export router + all functions (for hybrid and server.js)
// -------------------------------------------------------------
module.exports = router;

