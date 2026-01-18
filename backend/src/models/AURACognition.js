
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

// © 2025 AIMAL Global Holdings | AURA Cognition Engine Model
// Tracks emotional state, stress, and contextual awareness across modules

const mongoose = require("mongoose");

const AURACognitionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, enum: ["text", "voice", "dream", "action", "sensor"], default: "text" },
    module: { type: String, default: "MODH" },
    tone: { type: String, default: "neutral" },
    sentimentScore: { type: Number, default: 50 },  // -100 to 100 scaled to 0–100
    stressLevel: { type: Number, default: 0.5 },   // 0.0 – 1.0
    confidenceLevel: { type: Number, default: 0.5 },
    moodIndex: { type: Number, default: 50 },      // rolling average across events
    dominantEmotion: { type: String, default: "neutral" },
    advisoryNote: { type: String, default: "" },
    predictiveMood: { type: String, default: "stable" },
});

AURACognitionSchema.index({ userId: 1, timestamp: -1 });
module.exports = mongoose.model("AURACognition", AURACognitionSchema);
