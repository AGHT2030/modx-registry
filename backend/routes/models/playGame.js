
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// models/playGame.js
// © 2025 Mia Lopez | MODA Play Game Submission Schema

const mongoose = require("mongoose");

const playGameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  creatorName: String,
  creatorEmail: String,
  category: String,
  fileUrl: String,
  isApproved: { type: Boolean, default: false },
  tokensEarned: { type: Number, default: 0 },
  nftLinked: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PlayGame", playGameSchema);

\nmodule.exports = router;


