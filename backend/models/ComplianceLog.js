
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

/**
 * © 2025 Mia Lopez | MODAStay Compliance Log Model
 */

const mongoose = require("mongoose");

const ComplianceLogSchema = new mongoose.Schema({
    propertyId: { type: String, required: true },
    eventType: { type: String, required: true }, // auth, geofence, rsa, device, policy, contract, rateLimit
    message: { type: String, required: true },
    metadata: { type: Object, default: {} },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ComplianceLog", ComplianceLogSchema);
