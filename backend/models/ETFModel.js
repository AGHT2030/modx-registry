
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

// © 2025 AG Holdings | MODX Ecosystem | ETF Schema
const mongoose = require("mongoose");

const ETFSchema = new mongoose.Schema(
    {
        symbol: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        assetClass: { type: String, default: "Digital Asset" },
        underlyingAssets: [{ type: String }],         // e.g. MODUSDs, INTI, XRP
        nav: { type: Number, default: 1.0 },          // Net Asset Value per share
        sharesOutstanding: { type: Number, default: 0 },
        totalAUM: { type: Number, default: 0 },
        manager: {
            name: { type: String, default: "BLC Equity Fund" },
            complianceEntity: { type: String, default: "Aimal Global Holdings Trust" },
            consultant: { type: String, default: "3rd Party Compliance Consultant" },
        },
        reportingFrequency: { type: String, default: "Daily" },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ETF", ETFSchema);
