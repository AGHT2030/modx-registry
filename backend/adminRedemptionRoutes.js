
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

/**
 * © 2025 Mia Lopez | Developer & IP Owner of CoinPurse™
 * Protected by patent and trademark laws.
 * Any request for architecture, API, or usage must be directed to Mia Lopez.
 */

const express = require("express");
const router = express.Router();

// In-memory store from tokenAPI
const { redemptionLimits } = require("./tokenAPI");

// Route to get redemption statistics
router.get("/redemption-stats", (req, res) => {
  res.json({ redemptionLimits });
});

// Route to reset redemption counts (admin only, protected in production)
router.post("/clear-redemptions", (req, res) => {
  for (let campaign in redemptionLimits) {
    redemptionLimits[campaign] = 0;
  }
  res.json({ success: true, message: "Redemption counters cleared." });
});

module.exports = router;

