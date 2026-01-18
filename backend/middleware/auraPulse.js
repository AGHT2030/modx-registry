
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

// © 2025 Mia Lopez | AIMAL Global Holdings
// AURA Pulse Middleware — secure cross-module router (CommonJS version)

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { io } = require("../aura/aura-spectrum.js");
const chalk = require("chalk");

const SECRET_KEY = process.env.AURA_SECRET || "⚡aura_failsafe_key";

function auraPulse(req, res, next) {
    try {
        const auth = req.headers["authorization"];
        if (!auth) throw new Error("Missing Authorization Header");

        const token = auth.replace("Bearer ", "");
        const decoded = jwt.verify(token, SECRET_KEY);
        req.role = decoded.role;
        req.module = decoded.module;

        io.emit("aura:pulse", {
            role: decoded.role,
            module: decoded.module,
            timestamp: new Date().toISOString(),
        });

        logPulseEvent(decoded.role, decoded.module);
        next();
    } catch (err) {
        console.error(chalk.red(`AURA Pulse Rejected: ${err.message}`));
        res.status(403).json({ error: "Unauthorized access" });
    }
}

function logPulseEvent(role, module) {
    const logDir = path.resolve("backend/vault/logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const line = `[${new Date().toISOString()}] ${role} accessed ${module}\n`;
    fs.appendFileSync(`${logDir}/heartbeat.log`, line);
}

module.exports = { auraPulse };
