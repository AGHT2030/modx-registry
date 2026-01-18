
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

const fs = require("fs");
const path = require("path");

const QUEUE_FILE = path.join(__dirname, "../../data/modusd-zk-queue.json");

module.exports = {
    async enqueue(galaxy, event) {
        let list = [];
        if (fs.existsSync(QUEUE_FILE)) {
            list = JSON.parse(fs.readFileSync(QUEUE_FILE));
        }
        list.push({ galaxy, ...event });
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(list, null, 2));
    },

    async replayIfOnline() {
        if (!global.MODLINK?.online) return;

        if (!fs.existsSync(QUEUE_FILE)) return;

        const list = JSON.parse(fs.readFileSync(QUEUE_FILE));

        for (const item of list) {
            await global.MODLINK.broadcast(
                item.galaxy,
                item.eventType,
                item.payload
            );
        }

        fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));
        console.log("🔄 Replayed queued zk events to MODLINK");
    }
};
