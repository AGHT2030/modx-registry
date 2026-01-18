
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

// backend/security/rsa/rsaVerify.js
const crypto = require("crypto");
const { RSAKey } = require("../security.model");

async function verifySignature({ signature, payload, propertyId }) {
    const key = await RSAKey.findOne({ propertyId }).sort({ version: -1 });
    if (!key) return false;

    const verifier = crypto.createVerify("SHA256");
    verifier.update(JSON.stringify(payload));
    verifier.end();

    return verifier.verify(key.publicKey, signature, "base64");
}

module.exports = { verifySignature };
