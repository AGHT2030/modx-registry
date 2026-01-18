
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// models/retailProduct.js
// © 2025 Mia Lopez | MODA Retail Product Schema

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  priceUSD: { type: Number, required: true },
  priceMODX: { type: Number, required: true },
  category: { type: String },
  stock: { type: Number, default: 0 },
  tags: [String],
  redeemable: { type: Boolean, default: false },
  sku: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RetailProduct", productSchema);

\nmodule.exports = router;


