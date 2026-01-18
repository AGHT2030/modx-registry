
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
// AI Autopilot Mode — Ari & Agador Adaptive Atmosphere Controller
// CommonJS compatible | Node v18 stable | Integrates with AURA Ambient Presets System

const { Server } = require("socket.io");
const logger = require("../../logger");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------
   🔹 AI AUTOPILOT STATE
-------------------------------------------------- */
let autopilotActive = true;
let currentZone = "Lobby";
let lastSentiment = { mood: 60, stress: 40, positivity: 70 };
let lastUpdate = Date.now();

/* --------------------------------------------------
   🔹 AUTHENTICATION HELPER (Zone Staff Login)
-------------------------------------------------- */
function verifyZoneToken(token) {
    try {
        const secret = process.env.COINPURSE_JWT_SECRET || "development_secret";
        const decoded = jwt.verify(token, secret);
        if (!decoded || !decoded.role)
            throw new Error("Invalid token structure");
        return decoded;
    } catch (err) {
        logger.warn(`⚠️ Zone auth failed: ${err.message}`);
        return null;
    }
}

/* --------------------------------------------------
   🔹 SENTIMENT TREND ANALYZER
-------------------------------------------------- */
function analyzeTrend(metrics) {
    const trend = {
        moodDelta: metrics.mood - lastSentiment.mood,
        stressDelta: metrics.stress - lastSentiment.stress,
        positivityDelta: metrics.positivity - lastSentiment.positivity,
    };
    lastSentiment = metrics;
    lastUpdate = Date.now();
    return trend;
}

/* --------------------------------------------------
   🔹 TONE + LIGHT BALANCER (LOGIC ENGINE)
-------------------------------------------------- */
function computeAtmosphere(trend, zone = currentZone) {
    const presets = {
        Lobby: { freq: 160, light: "#00bfff" },
        Lounge: { freq: 180, light: "#ffb347" },
        Suites: { freq: 100, light: "#34495e" },
    };

    const preset = presets[zone] || presets.Lobby;

    let freq = preset.freq;
    let color = preset.light;
    const toneShift = trend.moodDelta - trend.stressDelta + trend.positivityDelta;

    freq += toneShift * 0.3;
    const brightness = Math.min(
        1,
        Math.max(0, (trend.positivityDelta + 100) / 200)
    );

    if (trend.moodDelta > 5) color = "#9ef01a";
    else if (trend.stressDelta > 5) color = "#ff595e";
    else if (trend.positivityDelta < -10) color = "#4361ee";

    return {
        zone,
        freq,
        color,
        brightness,
        moodTrend: trend,
        autopilotActive,
        timestamp: new Date().toISOString(),
    };
}

/* --------------------------------------------------
   🔹 SOCKET.IO INITIALIZATION
-------------------------------------------------- */
function initAIAutopilot(server) {
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        logger.info(`🤖 Autopilot connected: ${socket.id}`);

        // Zone authentication
        socket.on("zone:auth", (token) => {
            const user = verifyZoneToken(token);
            if (!user) return socket.emit("auth:error", "Invalid credentials");
            socket.join(user.zone || "Lobby");
            socket.emit("auth:success", {
                message: `Welcome ${user.name}, zone ${user.zone}`,
            });
        });

        // Manual override for staff
        socket.on("zone:manual", (payload) => {
            if (!payload.token || !verifyZoneToken(payload.token))
                return socket.emit("auth:error", "Auth required");
            autopilotActive = false;
            io.to(payload.zone || "Lobby").emit("aura:zone:update", {
                ...payload,
                manual: true,
                timestamp: new Date().toISOString(),
            });
            logger.info(`🛰️ Manual override by staff: ${payload.zone}`);
        });

        // Sentiment feed from Whisper/AURA
        socket.on("aura:sentiment:update", (metrics) => {
            if (!autopilotActive) return;
            const trend = analyzeTrend(metrics);
            const atmosphere = computeAtmosphere(trend);
            io.emit("aura:zone:autopilot", atmosphere);
            logger.info(
                `🌈 Autopilot adjusted ${atmosphere.zone}: freq ${Math.round(
                    atmosphere.freq
                )}Hz, color ${atmosphere.color}`
            );
            logAtmosphere(atmosphere);
        });

        socket.on("disconnect", () =>
            logger.info(`❌ Autopilot disconnected: ${socket.id}`)
        );
    });

    logger.info("✅ AI Autopilot Socket.IO initialized");
    return io;
}

/* --------------------------------------------------
   🔹 ANALYTICS LOGGER
-------------------------------------------------- */
function logAtmosphere(data) {
    try {
        const logDir = path.join(__dirname, "../../logs/autopilot");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const filePath = path.join(
            logDir,
            `${new Date().toISOString().split("T")[0]}.jsonl`
        );
        fs.appendFileSync(filePath, JSON.stringify(data) + "\n");
    } catch (err) {
        logger.warn("⚠️ Autopilot log failed:", err);
    }
}

/* --------------------------------------------------
   🔹 ANALYTICS HELPERS
-------------------------------------------------- */
function getRecentAtmosphereLogs(limit = 100) {
    const logDir = path.join(__dirname, "../../logs/autopilot");
    const files = fs.readdirSync(logDir).sort().reverse();
    let lines = [];
    for (const file of files) {
        const content = fs.readFileSync(path.join(logDir, file), "utf8");
        lines.push(...content.trim().split("\n").reverse());
        if (lines.length >= limit) break;
    }
    return lines.slice(0, limit).map((l) => JSON.parse(l));
}

/* --------------------------------------------------
   🔹 EXPORTS
-------------------------------------------------- */
module.exports = {
    initAIAutopilot,
    analyzeTrend,
    computeAtmosphere,
    getRecentAtmosphereLogs,
};
