
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

// backend/security/middleware/antiReplay.js
const { Nonce } = require("../security.model");

async function antiReplay(req, res, next) {
    const nonce = req.headers["x-modastay-nonce"];
    if (!nonce) return res.status(400).json({ ok: false, error: "Missing nonce" });

    const exists = await Nonce.findOne({ nonce });
    if (exists) {
        return res.status(409).json({ ok: false, error: "Replay detected" });
    }

    await Nonce.create({ nonce });
    next();
}

module.exports = antiReplay;
