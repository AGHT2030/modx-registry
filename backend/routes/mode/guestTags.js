
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// 📁 routes/mode/guestTags.js
// © 2025 AGH | MODE Interactive Guest Tagging

const express = require("express");
const router = express.Router();
const ZoneActivityLog = require("../../models/ZoneActivityLog");

// 🧷 POST /mode/guest-tags — Create a new tag
router.post("/", async (req, res) => {
  try {
    const { eventId, venueId, userId, zoneLabel, tagType, coordinates, notes } =
      req.body;

    const log = await ZoneActivityLog.create({
      eventId,
      venueId,
      userId,
      zoneLabel,
      tagType,
      coordinates,
      notes,
      status: "pending",
    });

    res.json({ success: true, log });
  } catch (err) {
    console.error("Guest tag error:", err);
    res.status(500).json({ error: "Unable to tag zone" });
  }
});

module.exports = router;



