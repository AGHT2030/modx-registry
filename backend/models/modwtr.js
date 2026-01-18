
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

// backend/models/modwtr.js
const mongoose = require("mongoose");

const ModWtrSchema = new mongoose.Schema(
    {
        projectName: { type: String, required: true },
        location: String,
        volume: Number,
        purityLevel: String,
        investmentAmount: Number,
        walletAddress: String,
        txHash: String,
        status: { type: String, enum: ["active", "maintenance", "complete"], default: "active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ModWtr", ModWtrSchema);


