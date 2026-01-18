
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// models/mobilitySubmission.js
// © 2025 Mia Lopez | MODA Mobility Creator Submission Schema

const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  creatorName: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  creatorWallet: { type: String },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ["nft", "show", "game", "immersive", "other"],
    required: true,
  },
  description: { type: String },
  contentUrl: { type: String, required: true }, // IPFS, S3, or direct link
  nftContract: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MobilitySubmission", submissionSchema);

\nmodule.exports = router;


