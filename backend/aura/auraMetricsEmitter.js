
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

// ===============================================================
// © 2025 AIMAL Global Holdings | AURA System Metrics Emitter (CJS)
// ===============================================================
// Purpose:
//   • Emits live system + cognitive metrics (CPU, memory, drift, recovery)
//   • Broadcasts to connected AURA Realtime clients via Socket.IO
//   • Maintains global drift history for AI sentiment drift prediction
//
// Notes:
//   • Safe for CommonJS environments (PM2, Node v18+)
//   • Works with cognitive analytics modules in ./aura
//   • Called by server.js → initAuraMetricsEmitter(auraIO)
//
// ===============================================================

const os = require("os");
const Cognitive = require("./cognitiveDriftIndex");
const { estimateDriftRecovery } = require("./driftRecoveryPredictor");

// 🧠 Optional fallback cognitive module
let CognitiveAlt = Cognitive;
try {
    const adminPath = "./admin/cognitive";
    CognitiveAlt = require(adminPath);
    console.log("✅ AURA Cognitive Analytics (admin) loaded");
} catch (err) {
    console.warn("⚠️ AURA admin cognitive module not available:", err.message);
}

// ===============================================================
// 🔹 Helper — CPU Load Calculator
// ===============================================================
function getCpuLoad() {
    const cpus = os.cpus();
    const total = cpus.reduce(
        (acc, c) => {
            const { user, nice, sys, idle, irq } = c.times;
            return {
                idle: acc.idle + idle,
                total: acc.total + user + nice + sys + idle + irq,
            };
        },
        { idle: 0, total: 0 }
    );
    return 100 - Math.round((100 * total.idle) / total.total);
}

// ===============================================================
// 🔹 Drift Metrics Updater
// ===============================================================
function updateDriftMetrics(ariEmotion, agadorEmotion) {
    const drift =
        (CognitiveAlt.calculateCognitiveDrift?.(ariEmotion, agadorEmotion) ??
            Cognitive.calculateCognitiveDrift?.(ariEmotion, agadorEmotion)) || 0;

    const recovery =
        CognitiveAlt.estimateDriftRecovery?.(global.driftHistory || []) ??
        estimateDriftRecovery(global.driftHistory || []);

    global.driftHistory = [
        ...(global.driftHistory || []).slice(-20),
        { divergence: drift, recovery, timestamp: new Date().toISOString() },
    ];

    return { drift, recovery };
}

// ===============================================================
// 🔹 Primary Export — Initialize AURA MetricsEmitter
// ===============================================================
function initAuraMetricsEmitter(auraIO) {
    if (!auraIO || typeof auraIO.emit !== "function") {
        console.warn("⚠️ AURA MetricsEmitter: auraIO not available — emitter skipped.");
        return;
    }

    // make auraIO globally visible to allow real-time drift broadcast
    global.auraIO = auraIO;

    console.log("🧠 AURA MetricsEmitter initialized — broadcasting every 5s.");

    setInterval(() => {
        try {
            // ---------------------------------------------------
            // 🧩 Gather System Stats
            // ---------------------------------------------------
            const cpu = getCpuLoad();
            const memory = Math.round((os.totalmem() - os.freemem()) / (1024 * 1024));
            const uptime = os.uptime();

            // ---------------------------------------------------
            // 🎭 Generate AI Emotion Sample (Ari + Agador)
            // ---------------------------------------------------
            const ariEmotion = Math.random();
            const agadorEmotion = Math.random();

            // ---------------------------------------------------
            // 🧠 Compute Cognitive Drift & Recovery
            // ---------------------------------------------------
            const { drift, recovery } = updateDriftMetrics(ariEmotion, agadorEmotion);

            // ---------------------------------------------------
            // 🩺 XRPL Health (ONE-LINE, NON-INVASIVE)
            // ---------------------------------------------------
            const xrplDegraded = !!global.XRPL_DEGRADED;

            // ---------------------------------------------------
            // 📦 Emit payload to connected AURA clients
            // ---------------------------------------------------
            const payload = {
                timestamp: new Date().toISOString(),
                cpu,
                memory,
                uptime,
                drift,
                recovery,
                ariEmotion,
                agadorEmotion,
                xrplDegraded, // 👈 dashboard badge flag
                driftHistory: global.driftHistory?.slice(-5) || [],
                xrplStatus: global.XRPL_DEGRADED ? "DEGRADED" : "OK"
            };

            auraIO.emit("aura:system:metrics", payload);

            // 🔹 Enhanced Broadcast for Cognitive Recovery
            auraIO.emit("aura:drift:recovery", {
                drift,
                recovery,
                trend: recovery?.trend || "unknown",
                recoveryPotential: recovery?.recoveryPotential || 0,
                timestamp: payload.timestamp,
            });

            // 🔴 XRPL Degraded Badge (one-liner emitter)
            auraIO.emit("xrpl:health", {
                degraded: xrplDegraded,
                timestamp: payload.timestamp,
            });

            console.log(
                `📊 AURA Metrics → CPU: ${cpu}% | Memory: ${memory} MB | Drift: ${(drift * 100).toFixed(
                    2
                )}% | Recovery: ${typeof recovery === "object"
                    ? `${recovery.recoveryPotential?.toFixed?.(1) || "N/A"}%`
                    : `${(recovery * 100).toFixed(1)}%`
                } | XRPL: ${xrplDegraded ? "DEGRADED" : "OK"}`
            );
        } catch (err) {
            console.error("❌ AURA MetricsEmitter error:", err.message);
        }
    }, 5000);
}

// ===============================================================
// 🔹 Export Module
// ===============================================================
module.exports = initAuraMetricsEmitter;
