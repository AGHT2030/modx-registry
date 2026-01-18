
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

// © 2025 Mia Lopez | MODAStay Property Registry (MongoDB)

const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
    name: { type: String, required: true },
    propertyId: { type: String, required: true, unique: true },

    // Licensing & status
    licenseKey: { type: String, required: true },
    status: {
        type: String,
        enum: ["active", "suspended", "revoked"],
        default: "active"
    },

    // RSA public keys (current + rotated)
    publicKeys: [
        {
            key: String,
            createdAt: { type: Date, default: Date.now },
            expiresAt: Date,
            revoked: { type: Boolean, default: false }
        }
    ],

    // Contract restrictions
    allowedContracts: [String],

    // GEO-FENCING
    geoFence: {
        type: {
            lat: Number,
            lng: Number,
            radiusMeters: Number   // enforce request origin within radius
        },
        required: false
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Property", PropertySchema);
