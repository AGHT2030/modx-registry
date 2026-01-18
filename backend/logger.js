
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
 * backend/logger.js
 * � 2025 MODX | Universal Logger (CommonJS Safe)
 */

const fs = require("fs");
const path = require("path");

// Log directory setup
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "modx.log");

function write(level, msg) {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}\n`;
    fs.appendFileSync(logFile, line, "utf8");
    console.log(line.trim());
}

function info(msg) {
    write("info", msg);
}
function warn(msg) {
    write("warn", msg);
}
function error(msg) {
    write("error", msg);
}

/**
 * A true middleware generator for Express routes
 */
function modlinkLogger(label, action) {
    return function (req, res, next) {
        const ip = req.ip || req.connection?.remoteAddress || "unknown-ip";
        const user = req.user?.email || "guest";
        const msg = `[${label}] ${action} | ${req.method} ${req.originalUrl} | user: ${user} | ip: ${ip}`;
        info(msg);
        next();
    };
}

module.exports = {
    info,
    warn,
    error,
    modlinkLogger,
};

