
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

// © 2025 Mia Lopez | MODE Event Model
import mongoose from "mongoose";

const ModeEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    startDate: Date,
    endDate: Date,
    venue: String,
    organizer: { type: String, required: true },
    budget: { type: Number, default: 0 },
    theme: String,
    sponsors: [String],
    status: {
        type: String,
        enum: ["draft", "active", "archived"],
        default: "draft"
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ModeEvent", ModeEventSchema);

