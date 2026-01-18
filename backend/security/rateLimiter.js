
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

// backend/security/rateLimiter.js
const rateMemory = {};

function rateLimiter(req, res, next) {
    const propertyId = req.headers["x-modastay-property"];
    if (!propertyId) return next();

    const now = Date.now();

    if (!rateMemory[propertyId]) {
        rateMemory[propertyId] = { count: 0, ts: now };
    }

    const entry = rateMemory[propertyId];

    if (now - entry.ts > 60000) {
        entry.count = 0;
        entry.ts = now;
    }

    entry.count++;

    if (entry.count > 120) {
        return res.status(429).json({ ok: false, error: "Rate limit exceeded" });
    }

    next();
}

module.exports = rateLimiter;
