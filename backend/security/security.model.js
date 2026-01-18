
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

// backend/security/security.model.js
const mongoose = require("mongoose");

// Active RSA keys per property
const rsaKeySchema = new mongoose.Schema({
    propertyId: { type: String, required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    version: { type: Number, default: 1 },
    rotatedAt: { type: Date, default: Date.now }
});

// Anti-Replay Nonces
const nonceSchema = new mongoose.Schema({
    nonce: { type: String, required: true, unique: true },
    createdAt: { type: Date, expires: 300, default: Date.now } // auto-expire 5 min
});

// Device registry
const deviceSchema = new mongoose.Schema({
    deviceId: String,
    fingerprint: String,
    propertyId: String,
    banned: { type: Boolean, default: false },
    bannedReason: String,
    bannedAt: Date
});

// Compliance Log
const complianceLogSchema = new mongoose.Schema({
    event: String,
    propertyId: String,
    details: Object,
    createdAt: { type: Date, default: Date.now }
});

module.exports = {
    RSAKey: mongoose.model("RSAKey", rsaKeySchema),
    Nonce: mongoose.model("Nonce", nonceSchema),
    Device: mongoose.model("Device", deviceSchema),
    ComplianceLog: mongoose.model("ComplianceLog", complianceLogSchema)
};
