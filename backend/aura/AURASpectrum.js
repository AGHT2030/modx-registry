
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

/**
 * © 2025 Mia Lopez | AIMAL Global Holdings
 * AURA Spectrum Socket Layer — dynamic port, single-instance global server.
 */

const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

let io;

/* ------------------------------------------------------------------
   ⚙️ Initialize / Reuse Singleton
------------------------------------------------------------------ */
if (!global._aura_io) {
    const PORT = process.env.AURA_PORT || process.env.PORT || 8091;

    // ⭐ Create the real socket server
    io = new Server(PORT, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        serveClient: false,
        maxHttpBufferSize: 1e7,
        pingTimeout: 60000,
    });

    global._aura_io = io;
    console.log(`🌀 AURA Spectrum Socket Stub active on :${PORT}`);

    /* --------------------------------------------------------------
       🛰️  Connection Lifecycle
    -------------------------------------------------------------- */
    io.on("connection", (socket) => {
        console.log(`🔗 AURA Client connected: ${socket.id}`);
        socket.emit("aura-status", { ok: true, mode: "spectrum" });

        socket.on("disconnect", () =>
            console.log(`❎ AURA Client disconnected: ${socket.id}`)
        );

        /* ----------------------------------------------------------
           🧠 Governance Event Bridge (Admin ↔ Sentinel)
        ---------------------------------------------------------- */
        socket.on("policy:advisory:response", (data) => {
            console.log("🧩 Policy response received:", data);

            // Broadcast acknowledgment
            io.emit("policy:advisory:ack", {
                status: "received",
                action: data.action,
                context: data.context,
                timestamp: data.timestamp,
            });

            // Persist governance log
            try {
                const logDir = path.join(__dirname, "../../logs");
                const logPath = path.join(logDir, "governance-responses.json");
                if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

                const current = fs.existsSync(logPath)
                    ? JSON.parse(fs.readFileSync(logPath, "utf8"))
                    : [];
                current.push(data);
                fs.writeFileSync(logPath, JSON.stringify(current, null, 2));
                console.log("💾 Logged governance response to file.");
            } catch (err) {
                console.warn("⚠️ Failed to write governance log:", err.message);
            }

            // AURA Twin voice reaction
            const twin =
                data.action === "approve"
                    ? "Ari"
                    : data.action === "mitigate"
                        ? "Agador"
                        : "Agador";

            const msg =
                data.action === "approve"
                    ? "Governance action approved and synchronized with MODLINK DAO."
                    : data.action === "mitigate"
                        ? "Mitigation protocol initiated — Sentinel notified."
                        : "Incident logged for further investigation.";

            sendTwinVoiceFeedback(twin, msg);
        });
    });
} else {
    io = global._aura_io;
    console.log("♻️ Reusing existing AURA Spectrum instance");
}

/* ------------------------------------------------------------------
   🔊 Emit Helpers
------------------------------------------------------------------ */

// Generic emitter
function emitAuraPulse(channel, metrics) {
    try {
        io.emit(channel, { metrics });
        console.log(`📡 [AURA] Emitted ${channel} pulse:`, metrics.summary);
    } catch (err) {
        console.warn("⚠️ Failed to emit AURA pulse:", err.message);
    }
}

// Retail-specific helper
function emitRetailPulse(metrics) {
    emitAuraPulse("aura:pulse:retail", metrics);
}

/* ------------------------------------------------------------------
   🗣️ AURA Voice Feedback Integration
------------------------------------------------------------------ */
async function sendTwinVoiceFeedback(twin, message) {
    try {
        const voiceAPI =
            process.env.AURA_TWIN_VOICE_URL ||
            "http://localhost:8083/api/aura/voice/speak";

        // Broadcast to UI
        io.emit("aura:twin:voice", { twin, message });
        console.log(`🎤 [AURA] ${twin} speaking: "${message}"`);

        // Send to voice backend
        await axios.post(
            voiceAPI,
            {
                twin,
                message,
                style: twin === "Ari" ? "soft" : "strategic",
            },
            { timeout: 5000 }
        );
    } catch (err) {
        console.warn("⚠️ AURA voice feedback skipped:", err.message);
    }
}

/* ------------------------------------------------------------------
   🧠 Example Retail Pulse (demo)
------------------------------------------------------------------ */
function triggerRetailMoodFeedback() {
    const metrics = {
        mood: 82,
        stress: 20,
        positivity: 90,
        summary: "Retail energy high — user excitement detected.",
    };

    emitRetailPulse(metrics);

    if (metrics.positivity > 80) {
        sendTwinVoiceFeedback(
            "Ari",
            "Positivity rising — this is a perfect moment to showcase new NFTs and exclusive offers."
        );
    } else if (metrics.stress > 60) {
        sendTwinVoiceFeedback(
            "Agador",
            "Stress levels are climbing. Consider calming promotions or highlighting loyalty benefits."
        );
    } else {
        sendTwinVoiceFeedback(
            "Ari",
            "Retail mood stable — continuing to monitor trends."
        );
    }
}

/* ------------------------------------------------------------------
   🚨 Policy Bridge: Manual Trigger
------------------------------------------------------------------ */
function emitPolicyAck(action, context = {}) {
    try {
        io.emit("policy:advisory:ack", { action, context, timestamp: Date.now() });
        console.log(`✅ [AURA] Emitted policy acknowledgment → ${action}`);
    } catch (err) {
        console.warn("⚠️ Failed to emit policy acknowledgment:", err.message);
    }
}

/* ------------------------------------------------------------------
   🚀 Final Export (Required for Tier-5 Engines)
------------------------------------------------------------------ */
module.exports = io; // ⭐ THIS FIXES io.emit() everywhere

// Optional export of helpers if needed
module.exports.emitAuraPulse = emitAuraPulse;
module.exports.emitRetailPulse = emitRetailPulse;
module.exports.sendTwinVoiceFeedback = sendTwinVoiceFeedback;
module.exports.triggerRetailMoodFeedback = triggerRetailMoodFeedback;
module.exports.emitPolicyAck = emitPolicyAck;

// 🔄 Auto test pulse
setTimeout(triggerRetailMoodFeedback, 5000);
