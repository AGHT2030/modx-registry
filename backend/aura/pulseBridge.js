
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

// © 2025 AIMAL Global Holdings | AURA Pulse-Bridge
// Connects Whisper sentiment + DAO metrics → real-time AURA socket channels

const { io } = require("./aura-spectrum");
const axios = require("axios");
const EventEmitter = require("events");

class PulseBridge extends EventEmitter {
    constructor() {
        super();
        this.cache = {}; // { context: metrics }
        this.init();
    }

    init() {
        console.log("🌐 AURA Pulse-Bridge online — linking sentiment to sockets.");

        // Handle new socket connections
        io.on("connection", (socket) => {
            console.log(`🔗 Pulse client connected: ${socket.id}`);
            // Send cached metrics on join
            for (const [ctx, data] of Object.entries(this.cache)) {
                socket.emit(`aura:pulse:${ctx}`, data);
            }
        });

        // Local emitter events (optional internal usage)
        this.on("sentiment:update", (payload) => this.broadcast(payload));
    }

    /** Accept raw whisper/modlink payload and re-emit */
    broadcast(payload) {
        try {
            const { dao = "PublicDAO", context = "general", metrics = {} } = payload;
            const ctxKey = context.toLowerCase();

            this.cache[ctxKey] = { dao, context: ctxKey, metrics, timestamp: Date.now() };
            io.emit(`aura:pulse:${ctxKey}`, this.cache[ctxKey]);

            console.log(
                `📡 AURA Pulse broadcast → aura:pulse:${ctxKey} | mood:${metrics.mood} stress:${metrics.stress}`
            );
        } catch (err) {
            console.error("❌ Pulse broadcast failed:", err.message);
        }
    }

    /** Optional REST webhook for MODLINK Gateway forwarders */
    async handleIncoming(req, res) {
        try {
            const { dao, context, metrics } = req.body || {};
            if (!metrics) return res.status(400).json({ error: "Missing metrics" });

            this.broadcast({ dao, context, metrics });
            return res.json({ ok: true, message: "Pulse accepted" });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

const pulseBridge = new PulseBridge();
module.exports = pulseBridge;
