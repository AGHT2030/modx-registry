
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

// backend/security/middleware/deviceCheck.js
const { Device } = require("../security.model");

async function deviceCheck(req, res, next) {
    const deviceId = req.headers["x-device-id"];
    if (!deviceId) return res.status(400).json({ ok: false, error: "Missing device ID" });

    const device = await Device.findOne({ deviceId });

    if (device?.banned) {
        return res.status(403).json({
            ok: false,
            error: "Device banned",
            reason: device.bannedReason
        });
    }

    next();
}

module.exports = deviceCheck;
