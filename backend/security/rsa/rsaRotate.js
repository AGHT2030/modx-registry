
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

// backend/security/rsa/rsaRotate.js
const crypto = require("crypto");
const { RSAKey } = require("../security.model");

async function rotateRSAKey(propertyId) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

    const previous = await RSAKey.findOne({ propertyId }).sort({ version: -1 });
    const nextVersion = previous ? previous.version + 1 : 1;

    const key = new RSAKey({
        propertyId,
        publicKey,
        privateKey,
        version: nextVersion
    });

    await key.save();
    return key;
}

module.exports = { rotateRSAKey };
