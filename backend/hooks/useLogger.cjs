
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

// © 2025 AIMAL Global Holdings | Modular Logger
// Provides lightweight file + console logging for DAO, Vault, and XRPL operations

const fs = require("fs");
const path = require("path");

const logsDir = path.join(process.cwd(), "backend", "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFile = path.join(logsDir, "runtime.log");

function logEvent(level, title, payload = {}) {
    const time = new Date().toISOString();
    const entry = {
        time,
        level,
        title,
        payload,
    };

    const line = `[${time}] [${level.toUpperCase()}] ${title} — ${JSON.stringify(payload)}\n`;
    fs.appendFileSync(logFile, line);

    if (level === "error") {
        console.error(`❌ ${title}`, payload);
    } else if (level === "success") {
        console.log(`✅ ${title}`, payload);
    } else {
        console.log(`🔹 ${title}`, payload);
    }
}

module.exports = { logEvent };

