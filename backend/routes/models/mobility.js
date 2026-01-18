
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// models/mobility.js
// © 2025 Mia Lopez | MODA Mobility Student Submission Schema

const mongoose = require("mongoose");

const mobilitySchema = new mongoose.Schema({
  studentName: String,
  walletAddress: { type: String, required: true },
  school: String,
  submissionType: String, // art, game, music, etc.
  fileUrl: String,
  nftMinted: { type: Boolean, default: false },
  tokensEarned: { type: Number, default: 0 },
  sponsor: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Mobility", mobilitySchema);

\nmodule.exports = router;


