
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

// © 2025 Mia Lopez | CreaTV Session Sync Middleware (Express Safe + Hybrid Integration)
// Handles user sessions, token refresh, and CreaTV content sync across MODA / AIRS ecosystem.
// Hardened against null middleware crashes and PM2 log duplication artifacts.
// Extended: includes /health check, hybrid sync w/ MODE + AIRS + CoinPurse.

const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// 🧩 Local logger fallback (no color codes to prevent PM2 text duplication)
const log = (msg) => console.log(`[CreaTV] ${msg}`);

// ---------------------------------------------------------------------------
// ✅ Load environment if not already loaded
// ---------------------------------------------------------------------------
const overridePath = path.resolve(__dirname, "../../.env.override");
const devPath = path.resolve(__dirname, "../../.env.dev");
if (fs.existsSync(overridePath)) require("dotenv").config({ path: overridePath });
else if (fs.existsSync(devPath)) require("dotenv").config({ path: devPath });

// ---------------------------------------------------------------------------
// 🧠 Session cache / placeholder for future live DB integration
// ---------------------------------------------------------------------------
const sessionCache = new Map();

// ---------------------------------------------------------------------------
// 🔹 Middleware: syncCreatvSessions — unify hybrid sessions across layers
// ---------------------------------------------------------------------------
function syncCreatvSessions(req, res, next) {
    try {
        const modeCtx = req.modeSession || {};
        const airsCtx = req.airsContext || {};
        const coinCtx = req.coinpurseSession || {};

        req.creatvSession = {
            id: Date.now(),
            synced: true,
            user: req.user || { id: "guest", role: "viewer" },
            source: req.ip,
            linkedModules: {
                modeLinked: !!modeCtx.active,
                airsLinked: !!airsCtx.processed,
                coinLinked: !!coinCtx.connected,
            },
            timestamp: new Date().toISOString(),
        };

        log(`🎬 CreaTV session synced for ${req.creatvSession.user.id}`);
        next();
    } catch (err) {
        log(`⚠️ CreaTV sync fallback: ${err.message}`);
        next();
    }
}

// ---------------------------------------------------------------------------
// 🔹 Route: /creatv/sync → Sync user data, tokens, or preferences
// ---------------------------------------------------------------------------
router.post("/sync", async (req, res) => {
    try {
        const { userId, token, device } = req.body;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        const timestamp = Date.now();
        sessionCache.set(userId, { token, device, timestamp });

        log(`🔄 Synced session for ${userId} (${device || "unknown device"})`);
        res.json({ ok: true, syncedAt: timestamp });
    } catch (err) {
        log(`❌ Sync error: ${err.message}`);
        res.status(500).json({ error: "Internal error syncing session" });
    }
});

// ---------------------------------------------------------------------------
// 🔹 Route: /creatv/session/:userId → Retrieve current session info
// ---------------------------------------------------------------------------
router.get("/session/:userId", (req, res) => {
    const { userId } = req.params;
    if (!sessionCache.has(userId)) {
        log(`⚠️ Session not found for ${userId}`);
        return res.status(404).json({ error: "Session not found" });
    }
    res.json({ userId, ...sessionCache.get(userId) });
});

// ---------------------------------------------------------------------------
// 🔹 Route: /creatv/flush → Admin utility to clear sessions
// ---------------------------------------------------------------------------
router.post("/flush", (req, res) => {
    sessionCache.clear();
    log("🧹 All CreaTV sessions cleared.");
    res.json({ ok: true, cleared: true });
});

// ---------------------------------------------------------------------------
// 🔹 Route: /creatv/health → Service status + hybrid module check
// ---------------------------------------------------------------------------
router.get("/health", (req, res) => {
    res.json({
        service: "CreaTV Sync Middleware",
        status: "online",
        activeSessions: sessionCache.size,
        linkedModules: ["MODE", "AIRS", "CoinPurse"],
        timestamp: new Date().toISOString(),
    });
});

// ---------------------------------------------------------------------------
// ✅ Export middleware and router for unified loader
// ---------------------------------------------------------------------------
module.exports = router;
