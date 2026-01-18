
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

// © 2025 AIMAL Global Holdings | RSA Manager

const crypto = require("crypto");
const LicenseKey = require("../../database/models/LicenseKey");

exports.generateRSAKeyPair = async (propertyId, issuedTo) => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

    const fingerprint = crypto.createHash("sha256").update(privateKey).digest("hex");

    await LicenseKey.create({
        propertyId,
        issuedTo,
        publicKey,
        privateKeyFingerprint: fingerprint
    });

    return { publicKey, privateKey, fingerprint };
};
