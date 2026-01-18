
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

module.exports = function verifyPropertyAccess(req, res, next) {
    const contract = req.headers["x-modastay-contract"];
    const property = req.property;

    if (!property.allowedContracts.includes(contract)) {
        return res.status(403).json({
            ok: false,
            error: "Contract not authorized for this franchise property."
        });
    }

    next();
};
