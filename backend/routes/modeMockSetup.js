
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// 📂 routes/modeMockSetup.js
// © 2025 AGH | MODE Mockup Immersive Simulation Booking

const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// 🎭 Book a mock immersive setup for walkthrough
router.post("/book-mock", async (req, res) => {
  try {
    const { eventId, coordinatorId, immersive, addOnPrice } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    event.mockSetup = {
      coordinatorId,
      immersive,
      addOnPrice,
      bookedAt: new Date(),
    };
    await event.save();

    res.json({ message: "Mock immersive setup booked" });
  } catch (err) {
    console.error("Mock setup booking error:", err);
    res.status(500).json({ error: "Error booking mock setup" });
  }
});

module.exports = router;



