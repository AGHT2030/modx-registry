
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

// backend/security/middleware/verifyLicenseKey.js
function verifyLicenseKey(req, res, next) {
    const key = req.headers["x-modastay-license"];
    if (!key || key !== process.env.MODASTAY_LICENSE_KEY) {
        return res.status(401).json({ ok: false, error: "Invalid MODAStay License Key" });
    }
    next();
}

module.exports = verifyLicenseKey;
