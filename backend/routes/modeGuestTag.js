
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// 📂 routes/modeGuestTag.js
// © 2025 AGH | MODE Interactive Guest Tag System

const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");
const { notifyGuestTagEvent } = require("../utils/guestTagNotifier");

// 🏷️ Tag guest with event moments (e.g., cake cutting, photos)
router.post("/tag", async (req, res) => {
  try {
    const { guestId, eventId, tagType, location } = req.body;

    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ error: "Guest not found" });

    guest.tags.push({ eventId, tagType, location, timestamp: new Date() });
    await guest.save();

    await notifyGuestTagEvent(guest.contactInfo, tagType, location);
    res.json({ message: `Guest tagged for ${tagType}` });
  } catch (err) {
    console.error("Guest tag error:", err);
    res.status(500).json({ error: "Could not tag guest" });
  }
});

module.exports = router;



