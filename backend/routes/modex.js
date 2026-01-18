
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// routes/modex.js
// © 2025 Mia Lopez | MODEX Immersive Experience API

const express = require("express");
const router = express.Router();
const ModexExperience = require("../models/modexExperience");

// 📥 POST /api/modex - Add new immersive experience
router.post("/", async (req, res) => {
  try {
    const newExperience = new ModexExperience(req.body);
    const saved = await newExperience.save();
    res.status(201).json(saved);
  } catch (err) {
    res
      .status(400)
      .json({ message: "❌ Failed to save experience", error: err.message });
  }
});

// 📤 GET /api/modex - List experiences (by category/room type)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.roomType) filter.roomType = req.query.roomType;

    const data = await ModexExperience.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to fetch experiences", error: err.message });
  }
});

// ✏️ PATCH /api/modex/:id - Update immersive content
router.patch("/:id", async (req, res) => {
  try {
    const updated = await ModexExperience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "❌ Update failed", error: err.message });
  }
});

module.exports = router;



