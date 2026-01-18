
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

// © 2025 Mia Lopez | AIRS Core Logger
// 🕒 Tracks timestamped changes or loads of protected AIRS, MODE, and CreaTV files.
// Creates a permanent audit log under /backend/logs/AIRS_CORE_CHANGES.log

const fs = require("fs");
const path = require("path");

// Log file path (ensure persistence across builds)
const LOG_FILE = path.resolve(__dirname, "../logs/AIRS_CORE_CHANGES.log");

/**
 * Logs an AIRS core file change event.
 * @param {string} filePath - Path of the file that triggered the change.
 * @param {string} changeType - Type of change (e.g. "load", "update", "create", "delete").
 * @param {string} [details] - Optional note or details.
 */
function logAIRSChange(filePath, changeType = "update", details = "") {
    try {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${changeType.toUpperCase()} → ${filePath}\n${details}\n\n`;

        // ensure directory exists
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
        fs.appendFileSync(LOG_FILE, entry, "utf8");

        console.log(`🕒 AIRS Log: ${changeType.toUpperCase()} recorded for ${filePath}`);
    } catch (err) {
        console.error("❌ AIRS Logger error:", err);
    }
}

module.exports = { logAIRSChange, LOG_FILE };
