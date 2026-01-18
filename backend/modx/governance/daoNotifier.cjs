
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

// © 2025 AIMAL Global Holdings | DAO Notifier (CJS)
const fs = require("fs");
const path = require("path");

const LOG_PATH = path.resolve("./backend/modx/governance/logs/dao_actions.json");

function appendLog(entry) {
    try {
        const data = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) : [];
        data.push({ ...entry, at: new Date().toISOString() });
        fs.writeFileSync(LOG_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ DAO Notifier log error:", e.message);
    }
}

function initDaoNotifier(io) {
    if (!io) {
        console.warn("⚠️ initDaoNotifier called without io");
        return { notify: () => { } };
    }

    function notify(event, payload) {
        io.emit(event, payload);
        appendLog({ event, payload });
    }

    return { notify };
}

module.exports = initDaoNotifier;
