
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

// © 2025 AIMAL Global Holdings | UNLICENSED
// AURA Autopilot Live Analytics Stream (SSE + Secure Broadcast)
// Streams guest-density and sentiment metrics continuously
// Adds token-based verification for MODA/BLC/AI Autopilot broadcast security

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { getRecentAtmosphereLogs } = require("../../../aura/aiAutopilot");

// Active Server-Sent Events (SSE) clients
const clients = new Set();

/* --------------------------------------------------
   🔹 AUTHORIZED SYSTEM TOKENS
   Store securely in .env.override or .env.dev
-------------------------------------------------- */
const ALLOWED_SYSTEMS = {
    MODA_AUTOPILOT: process.env.AUTOPILOT_API_TOKEN,
    BLC_ADMIN: process.env.BLC_ADMIN_TOKEN,
    AI_AUTOPILOT: process.env.AI_AUTOPILOT_KEY,
};

/**
 * 🔐 Verify secure API key using constant-time comparison
 */
function verifySystemToken(req) {
    const headerToken =
        req.headers["x-api-key"] ||
        req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    if (!headerToken) return false;

    for (const [system, validToken] of Object.entries(ALLOWED_SYSTEMS)) {
        if (!validToken) continue;
        try {
            if (crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(validToken))) {
                req.authSystem = system;
                return true;
            }
        } catch {
            continue;
        }
    }
    return false;
}

/**
 * 🔹 Helper: broadcast updates to all connected dashboards
 */
function broadcastUpdate(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
        try {
            res.write(payload);
        } catch (err) {
            console.warn("⚠️ Stream write error:", err.message);
            clients.delete(res);
        }
    }
}

/**
 * 🔹 GET /api/aura/autopilot/live
 * Initiates Server-Sent Events stream for real-time analytics
 */
router.get("/live", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    clients.add(res);
    console.log(`📡 AURA client connected — total: ${clients.size}`);

    // Send initial atmosphere data immediately
    const initialData = getRecentAtmosphereLogs(30);
    res.write(`data: ${JSON.stringify({ type: "init", data: initialData })}\n\n`);

    // Keep-alive ping (to prevent connection timeout)
    const keepAlive = setInterval(() => res.write(":\n\n"), 30000);

    req.on("close", () => {
        clearInterval(keepAlive);
        clients.delete(res);
        console.log(`❌ AURA client disconnected — total: ${clients.size}`);
    });
});

/**
 * 🔹 POST /api/aura/autopilot/push
 * Authorized systems push updates to all dashboards in real time
 */
router.post("/push", express.json(), (req, res) => {
    // 🔐 Verify system token
    if (!verifySystemToken(req)) {
        console.warn("🚫 Unauthorized /api/aura/autopilot/push attempt detected");
        return res.status(403).json({ error: "Forbidden — invalid or missing API key" });
    }

    const { zone, moodTrend, guestDensity, color, timestamp, payload } = req.body;
    if (!zone || !moodTrend) {
        return res.status(400).json({ error: "Missing required fields: zone or moodTrend" });
    }

    // 🔒 HQ-only protection
    if (req.authSystem !== "BLC_ADMIN" && payload?.zone === "HQ_ONLY") {
        return res.status(403).json({ error: "HQ override required" });
    }

    // Construct update packet
    const update = {
        type: "update",
        source: req.authSystem,
        timestamp: timestamp || new Date().toISOString(),
        zone,
        moodTrend,
        guestDensity: guestDensity ?? null,
        color: color ?? "#ffffff",
    };

    console.log(`🛰️ Authorized broadcast from ${req.authSystem} (${zone})`);
    broadcastUpdate(update);

    res.json({ status: "ok", source: req.authSystem, message: "Broadcast sent successfully" });
});

module.exports = router;
