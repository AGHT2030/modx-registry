
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
 * © 2025 Mia Lopez | AG Holdings / MODAStay / MODE
 * Franchise Property Model (Unified)
 */

const mongoose = require("mongoose");

const FranchisePropertySchema = new mongoose.Schema({

    // ======================================================
    // 1️⃣ CORE PROPERTY METADATA
    // ======================================================
    propertyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },

    contactEmail: { type: String },
    contactPhone: { type: String },

    // ======================================================
    // 2️⃣ RSA LICENSE REGISTRATION
    // ======================================================
    rsa: {
        publicKey: { type: String },
        privateKeyEncrypted: { type: String },
        keyId: { type: String },             // rotating key ID
        issuedAt: { type: Date },
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true }
    },

    // ======================================================
    // 3️⃣ PER-PROPERTY SMART CONTRACTS
    // ======================================================
    contracts: {
        hybridStay: { type: String },        // MODAStay Hybrid contract address
        treasuryModule: { type: String },    // Optional treasury module
        loyaltyModule: { type: String },     // NFT/Loyalty module
        modeModule: { type: String },        // MODE contract
        lastSync: { type: Date }
    },

    // ======================================================
    // 4️⃣ MODE LICENSING (ENABLED HERE — YOUR ORIGINAL SECTION)
    // ======================================================
    MODE: {
        enabled: { type: Boolean, default: false },

        tier: {
            type: String,
            enum: ["none", "basic", "pro", "enterprise"],
            default: "none"
        },

        maxEventsPerMonth: { type: Number, default: 3 },
        autoApproval: { type: Boolean, default: false },

        coordinatorAccess: [
            {
                staffId: String,
                name: String,
                email: String,
                permissions: {
                    type: [String], // e.g. ["create-event", "approve-event", "venue"]
                    default: []
                }
            }
        ]
    },

    // ======================================================
    // 5️⃣ GEO-FENCE CONTROLS
    // ======================================================
    geoFence: {
        enabled: { type: Boolean, default: false },
        latitude: { type: Number },
        longitude: { type: Number },
        radiusMeters: { type: Number, default: 200 },  // default 200m
        lastUpdated: { type: Date }
    },

    // ======================================================
    // 6️⃣ STAFF REGISTRY
    // ======================================================
    staff: [
        {
            staffId: String,
            name: String,
            role: String, // admin, housekeeping, coordinator, etc.
            email: String,
            phone: String,
            permissions: [String]
        }
    ],

    // ======================================================
    // 7️⃣ COMPLIANCE LOG REFERENCES
    // ======================================================
    complianceLogRefs: [
        {
            logId: String,
            createdAt: Date
        }
    ],

    // ======================================================
    // 8️⃣ METADATA
    // ======================================================
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FranchiseProperty", FranchisePropertySchema);
