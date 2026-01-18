
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// 📁 routes/mode/mockSetup.js
// © 2025 AGH | MODE Mock Setup Simulator + Vendor Onboarding

const express = require("express");
const router = express.Router();
const MockSetup = require("../../models/MockSetup");

// 🎭 POST /mode/mock-setup — Create a mock setup
router.post("/", async (req, res) => {
  try {
    const { eventId, plannerId, layoutMap, proposedFee, vendorIds, notes } =
      req.body;

    const setup = await MockSetup.create({
      eventId,
      plannerId,
      layoutMap,
      proposedFee,
      vendorIds,
      notes,
    });

    // Simulate message to vendors (stub)
    vendorIds.forEach((vendorId) => {
      console.log(`✅ Onboarding message sent to vendor ${vendorId}`);
    });

    res.json({ success: true, setup });
  } catch (err) {
    console.error("Mock setup error:", err);
    res.status(500).json({ error: "Unable to create mock setup" });
  }
});

module.exports = router;



