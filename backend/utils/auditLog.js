
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

// backend/utils/auditLog.js (append)
exports.logVerifierEvent = async (event) => {
    const fs = require("fs");
    const path = require("path");
    const logDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    const logPath = path.join(logDir, "verifier-events.log");
    const entry = `${new Date().toISOString()} | ${event.status.toUpperCase()} | ${event.message || "No message"
        }\n`;

    fs.appendFileSync(logPath, entry);
};
