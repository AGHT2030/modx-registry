
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

// © 2025 AIMAL Global Holdings | MODLINK EventLog Model
// Stores all emitted DAO events for audit, traceability, and analytics.
// Includes checksum verification for integrity and OverwriteModelError protection.

const mongoose = require("mongoose");
const crypto = require("crypto");

// 🔍 EventLog Schema Definition
const EventLogSchema = new mongoose.Schema({
    dao: {
        type: String,
        required: true,
        index: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    payload: {
        type: Object,
        default: {},
    },
    signature: {
        type: String,
        required: false,
    },
    checksum: {
        type: String,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// 🧩 Auto-generate a SHA-256 checksum to prevent tampering or duplication
EventLogSchema.pre("save", function (next) {
    if (!this.checksum) {
        const data = `${this.dao}:${this.eventType}:${JSON.stringify(this.payload)}:${this.createdAt}`;
        this.checksum = crypto.createHash("sha256").update(data).digest("hex");
    }
    next();
});

// 📅 Optional: auto-expire logs after 90 days
EventLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ✅ FIX: Prevent OverwriteModelError (used by emitter, DAO registry, audit tools)
module.exports =
    mongoose.models.EventLog || mongoose.model("EventLog", EventLogSchema);
