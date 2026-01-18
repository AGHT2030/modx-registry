
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

// © 2025 Mia Lopez | MODX Immersive Experience Schema

const mongoose = require("mongoose");

const modexExperienceSchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // Wallet address or user ID
    experienceType: {
      type: String,
      enum: ["hologram", "AR", "VR", "NFT tour", "immersive event", "other"],
      default: "other",
    },
    description: { type: String },
    roomId: { type: String }, // Hotel room or museum space
    tokenUsed: { type: String }, // MODA Coin, MODX, etc.
    startTime: { type: Date },
    endTime: { type: Date },
    nftLinked: { type: String }, // Optional NFT unlock
    isActive: { type: Boolean, default: true },
    feedback: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MODEXPERIENCE", modexExperienceSchema);

