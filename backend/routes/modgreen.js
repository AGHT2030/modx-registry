
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

// � 2025 Mia Lopez | MODA Green Bond + ESG Tracker Model
// Mongoose schema for storing ESG & Green Bond data entries

const mongoose = require("mongoose");

// ?? Core MODA Green Bond Schema
const modGreenSchema = new mongoose.Schema(
    {
        // ?? Basic Info
        issuer: {
            type: String,
            required: [true, "Issuer name is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: [
                "Green Bond",
                "Social Bond",
                "Sustainability Bond",
                "Blue Bond",
                "Carbon Credit",
                "Farmland Bond",
                "Energy Transition Note",
                "Environmental ETF",
            ],
            required: [true, "Bond type is required"],
        },
        amount: {
            type: Number,
            required: [true, "Bond amount is required"],
            min: 0,
        },
        currency: {
            type: String,
            default: "USD",
            uppercase: true,
        },

        // ?? ESG Metrics
        esgScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 50,
        },
        category: {
            type: String,
            enum: [
                "Energy Efficiency",
                "Clean Water",
                "Sustainable Agriculture",
                "Green Buildings",
                "Transportation",
                "Biodiversity",
                "Recycling & Waste Reduction",
                "General ESG",
            ],
            default: "General ESG",
        },
        region: { type: String, trim: true },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Audited", "Rejected", "Archived"],
            default: "Pending",
        },

        // ?? Geographic & Origin Info
        country: { type: String, trim: true },
        city: { type: String, trim: true },
        latitude: { type: Number },
        longitude: { type: Number },

        // ?? Bond Lifecycle
        issueDate: { type: Date, default: Date.now },
        maturityDate: { type: Date },
        termYears: { type: Number },

        // ?? Tracking
        yieldRate: { type: Number, default: 0 },
        carbonOffsetTons: { type: Number, default: 0 },
        projectImpact: {
            type: String,
            trim: true,
            maxlength: 1000,
        },

        // ?? Ownership / Auth
        user: { type: String, trim: true },
        walletAddress: { type: String, trim: true },
        txHash: { type: String, trim: true },

        // ?? Internal metadata
        verifiedBy: { type: String, trim: true },
        notes: { type: String, trim: true, maxlength: 2000 },
    },
    {
        timestamps: true, // adds createdAt / updatedAt
    }
);

// ?? Derived virtual field
modGreenSchema.virtual("impactScore").get(function () {
    const base = this.esgScore || 50;
    const offset = this.carbonOffsetTons || 0;
    return Math.round(base + Math.min(offset / 10, 50));
});

// ?? Indexes for fast queries
modGreenSchema.index({ issuer: 1, type: 1, status: 1 });
modGreenSchema.index({ country: 1 });
modGreenSchema.index({ esgScore: -1 });

// ? Compile model
const ModGreen = mongoose.model("ModGreen", modGreenSchema);
module.exports = ModGreen;



