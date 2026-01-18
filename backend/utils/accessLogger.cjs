
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

// © 2025 AIMAL Global Holdings | Access Logger (CommonJS)
const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.TRACK_LOG_DIR || path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "investor_access.jsonl");

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

async function appendLog(obj) {
    return new Promise((resolve, reject) => {
        const line = JSON.stringify(obj) + "\n";
        fs.appendFile(LOG_FILE, line, (err) => (err ? reject(err) : resolve()));
    });
}

module.exports = { appendLog, LOG_FILE, LOG_DIR };
