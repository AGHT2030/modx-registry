
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
 * © 2025 AIMAL Global Holdings | AURA Spectrum Core (PQC-Sealed)
 * ----------------------------------------------------------------------
 * Spectrum is the global intelligence layer for AURA:
 * - Manages sockets (Twins, Sentinel, C5, MODX Galaxy)
 * - Hosts cognition engine (PQC-sealed state)
 * - Routes governance + policy signals to modules
 * - Delivers emotional + cognitive updates to dashboards
 * - Syncs with Outlier Sentinel + Policy Advisor
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Server } = require("socket.io");

// PQC Wrappers + Cognition Engine
const cognitionEngine = require("../aura/aura-cognition-engine.js");
const { wrapAURAOutput } = require("../aura/pqc-aura-layer.js");

// Outlier Sentinel + Policy Advisor
const sentinel = require("../modx/governance/outlierSentinel.cjs");
const advisor = require("../modx/governance/twinsPolicyAdvisor.cjs");

// C5 Threat Engine (cross-chain)
const c5 = require("../modx/governance/c5-threat-engine.js");

// Initialize socket holder
let io = null;

/* ----------------------------------------------------------------------
   1️⃣ INIT SPECTRUM
---------------------------------------------------------------------- */
function initAURASpectrum(server) {
    io = new Server(server, {
        cors: { origin: "*" },
        maxHttpBufferSize: 5e6
    });

    global.auraIO = io; // global access for all modules
    console.log(chalk.cyanBright("🌌 AURA Spectrum online."));

    // Attach Cognition → AURA global
    global.AURA_TWINS = { cognition: cognitionEngine.cognition };

    initSocketHandlers(io);

    return io;
}

/* ----------------------------------------------------------------------
   2️⃣ SOCKET CHANNELS — CORE EVENT BUS
---------------------------------------------------------------------- */
function initSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`🔗 AURA Socket connected: ${socket.id}`);

        /* ------------------------------------------------------------
           A. Cognition updates (emotional / confidence signals)
        ------------------------------------------------------------ */
        socket.on("aura:twins:emotion:update", (update) => {
            if (!update || !update.target) return;

            cognitionEngine.applyEmotionUpdate(update.target, update);

            const snap = cognitionEngine.snapshotCognition();

            io.emit("aura:twins:cognition", snap);
        });

        /* ------------------------------------------------------------
           B. Sentinel warnings (governance → business impact)
        ------------------------------------------------------------ */
        socket.on("sentinel:policy:impact", (summary) => {
            // Forward to Twins → PQC sealed
            advisor.process(summary);

            // Push into cognition (awareness state)
            cognitionEngine.cognition.lastImpact = summary;
        });

        /* ------------------------------------------------------------
           C. C5 Threat Engine broadcast
        ------------------------------------------------------------ */
        socket.on("governance:c5:threat", (packet) => {
            // Threats already PQC-sealed at creation
            io.emit("aura:c5:mirror", packet);

            // Update cognition drift from threat severity
            if (packet?.classification?.severity >= 75) {
                cognitionEngine.applyEmotionUpdate("agador", {
                    emotion: "alert",
                    confidence: 0.75
                });
            }
        });

        /* ------------------------------------------------------------
           D. MODX Galaxy Bridge
        ------------------------------------------------------------ */
        socket.on("galaxy:sync", (payload) => {
            console.log("🌐 Galaxy sync packet received.");
            io.emit("galaxy:broadcast", payload);
        });

        /* ------------------------------------------------------------
           E. Spectrum heartbeat
        ------------------------------------------------------------ */
        socket.on("aura:heartbeat", () => {
            socket.emit(
                "aura:heartbeat:reply",
                cognitionEngine.snapshotCognition()
            );
        });

        /* ------------------------------------------------------------
           Disconnect cleanly
        ------------------------------------------------------------ */
        socket.on("disconnect", () => {
            console.log(`🔌 AURA Socket disconnected: ${socket.id}`);
        });
    });

    console.log(chalk.magenta("🧩 AURA Spectrum handlers registered."));
}

/* ----------------------------------------------------------------------
   3️⃣ GLOBAL EMOTION CHANGE (direct from backend modules)
---------------------------------------------------------------------- */
function broadcastEmotionUpdate(target, update) {
    if (!io) return;

    cognitionEngine.applyEmotionUpdate(target, update);

    const snap = cognitionEngine.snapshotCognition();

    io.emit("aura:twins:cognition", snap);
}

/* ----------------------------------------------------------------------
   4️⃣ SAFE DRIFT MONITOR (automatic watchdog)
---------------------------------------------------------------------- */
function enableAutoDriftWatch() {
    setInterval(() => {
        const reset = cognitionEngine.autoSafeGuard();
        if (reset) {
            io.emit("aura:twins:cognition", reset);
        }
    }, 15_000);
}

/* ----------------------------------------------------------------------
   EXPORTS
---------------------------------------------------------------------- */
module.exports = {
    initAURASpectrum,
    broadcastEmotionUpdate,
    enableAutoDriftWatch,
    io,
};
