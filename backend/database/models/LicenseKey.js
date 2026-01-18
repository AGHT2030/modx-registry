
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

// Tracks RSA private key issuance & rotation audits

const mongoose = require("mongoose");

const LicenseKeySchema = new mongoose.Schema({
    propertyId: String,
    issuedTo: String,
    publicKey: String,
    privateKeyFingerprint: String,
    issuedAt: { type: Date, default: Date.now },
    rotatedAt: Date,
    revokedAt: Date
});

module.exports = mongoose.model("LicenseKey", LicenseKeySchema);
