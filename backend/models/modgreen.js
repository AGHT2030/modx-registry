
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

// backend/models/modgreen.js
// © 2025 Mia Lopez | MODGREEN Model (Green Bonds, ESG, and Blockchain Audit)

const mongoose = require("mongoose");

const ModGreenSchema = new mongoose.Schema(
    {
        projectName: { type: String, required: true },            // Project title
        bondType: { type: String, default: "ESG" },               // ESG, Carbon, PACE, etc.
        issuer: { type: String, required: true },                 // Issuer organization
        amount: { type: Number, required: true },                 // Bond amount
        maturityDate: { type: Date },                             // Optional maturity
        region: { type: String },                                 // Region or jurisdiction
        country: { type: String },                                // ISO country code
        rating: { type: String },                                 // ESG or Moody’s rating
        yieldRate: { type: Number },                              // Expected yield percentage
        description: { type: String },                            // Project details
        verificationProvider: { type: String },                   // Verified by agency
        walletAddress: { type: String },                          // Blockchain wallet
        txHash: { type: String },                                 // Blockchain transaction hash
        blockchainNetwork: { type: String, default: "Polygon" },  // Default to Polygon
        auditTrail: [
            {
                timestamp: { type: Date, default: Date.now },
                action: String,
                user: String,
                details: Object,
            },
        ],
        status: {
            type: String,
            enum: ["active", "matured", "completed", "defaulted", "pending"],
            default: "active",
        },
    },
    { timestamps: true }
);

// 🔗 Middleware: Log audit trail automatically on save/update
ModGreenSchema.pre("save", function (next) {
    if (this.isNew) {
        this.auditTrail.push({
            action: "CREATE",
            user: "system",
            details: { initialRecord: true },
        });
    } else {
        this.auditTrail.push({
            action: "UPDATE",
            user: "system",
            details: { modified: true },
        });
    }
    next();
});

// 🧾 Virtual for displaying summary
ModGreenSchema.virtual("summary").get(function () {
    return `${this.projectName} (${this.bondType}) - ${this.status.toUpperCase()} [${this.amount}]`;
});

module.exports = mongoose.model("ModGreen", ModGreenSchema);


