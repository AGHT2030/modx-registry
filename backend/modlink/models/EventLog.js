
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

// © 2025 AIMAL Global Holdings | MODLINK EventLog Schema
const mongoose = require("mongoose");

const EventLogSchema = new mongoose.Schema({
    dao: { type: String, index: true },
    eventType: String,
    payload: mongoose.Schema.Types.Mixed,
    signature: String,
    createdAt: { type: Date, default: () => new Date(), index: true },
});

// ✅ Prevent OverwriteModelError when required multiple times
module.exports =
    mongoose.models.EventLog ||
    mongoose.model("EventLog", EventLogSchema, "modlink_events");
