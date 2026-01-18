
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

const MODLINK = global.MODLINK;
const Queue = require("../../utils/fallbackQueue");

module.exports = {
    async broadcastEvent(eventType, payload) {
        // If MODLINK is online → real-time broadcast
        if (MODLINK?.online) {
            return MODLINK.broadcast("MODUSD_ZK", eventType, payload);
        }

        // Otherwise → queue event for replay
        await Queue.enqueue("MODUSD_ZK", {
            eventType,
            payload,
            timestamp: Date.now()
        });

        console.warn("⚠️ MODLINK offline — MODUSD_ZK event queued");
    }
};
