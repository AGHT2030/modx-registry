
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

// © 2025 AG Holdings Trust | HQ Master Key Gatekeeper

module.exports = function verifyHQMasterKey(req, res, next) {
    const key = req.headers["x-aghq-master"];

    if (!key || key !== process.env.AGHQ_MASTER_KEY) {
        return res.status(401).json({
            ok: false,
            error: "Unauthorized — HQ Master Key required."
        });
    }

    next();
};
