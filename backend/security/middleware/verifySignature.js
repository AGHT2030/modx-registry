
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

// backend/security/middleware/verifySignature.js
const { verifySignature } = require("../rsa/rsaVerify");

async function verifyRSASignature(req, res, next) {
    const signature = req.headers["x-modastay-signature"];
    const propertyId = req.headers["x-modastay-property"];

    if (!signature || !propertyId) {
        return res.status(400).json({ ok: false, error: "Missing signature or propertyId" });
    }

    const valid = await verifySignature({
        signature,
        payload: req.body,
        propertyId
    });

    if (!valid) {
        return res.status(403).json({ ok: false, error: "Invalid RSA Signature" });
    }

    next();
}

module.exports = verifyRSASignature;
