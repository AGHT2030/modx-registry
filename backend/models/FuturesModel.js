
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

// © 2025 AG Holdings | MODX Ecosystem | Futures Schema
const mongoose = require("mongoose");

const FuturesSchema = new mongoose.Schema(
    {
        contractSymbol: { type: String, required: true, unique: true },
        etfRef: { type: mongoose.Schema.Types.ObjectId, ref: "ETF" },
        expiryDate: { type: Date, required: true },
        leverage: { type: Number, default: 1 },
        openInterest: { type: Number, default: 0 },
        settlementType: { type: String, enum: ["cash", "token"], default: "cash" },
        collateralType: { type: String, default: "MODUSDs" },
        lastPrice: { type: Number, default: 0 },
        pnl: { type: Number, default: 0 },
        manager: {
            name: { type: String, default: "BLC Equity Fund Futures Desk" },
            complianceEntity: { type: String, default: "Aimal Global Holdings Trust" },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Futures", FuturesSchema);
