
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// 📂 routes/modeSponsorTag.js
// © 2025 AGH | Sponsor Tag Integration for Events

const express = require("express");
const router = express.Router();
const Sponsor = require("../models/Sponsor");

// 🔖 Tag event zones or experiences with sponsor metadata
router.post("/tag", async (req, res) => {
  try {
    const { sponsorId, tagLocation, adContent, duration } = req.body;

    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });

    sponsor.tags.push({
      location: tagLocation,
      adContent,
      duration,
      timestamp: new Date(),
    });

    await sponsor.save();
    res.json({ message: "Sponsor tag applied" });
  } catch (err) {
    console.error("Sponsor tag error:", err);
    res.status(500).json({ error: "Error tagging sponsor content" });
  }
});

module.exports = router;



