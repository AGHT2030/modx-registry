
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

// backend/models/moda.js
const mongoose = require("mongoose");

const ModaSchema = new mongoose.Schema(
    {
        venueName: { type: String, required: true },
        eventType: String,
        capacity: Number,
        price: Number,
        location: String,
        txHash: String,
        walletAddress: String,
        status: { type: String, enum: ["booked", "available", "maintenance"], default: "available" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Moda", ModaSchema);

