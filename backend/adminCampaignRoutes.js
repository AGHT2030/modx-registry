
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

// In-memory campaign storage (replace with DB logic in production)
let activeCampaigns = {
  grizzlies_promo: true,
  meta_concert: true,
  default: true,
};

// Route to get current campaign statuses
router.get("/status", (req, res) => {
  res.json(activeCampaigns);
});

// Route to toggle a campaign's active status
router.post("/toggle", (req, res) => {
  const { campaignName, active } = req.body;
  if (typeof active !== "boolean" || !campaignName) {
    return res
      .status(400)
      .json({ error: "Invalid campaignName or active status." });
  }
  activeCampaigns[campaignName] = active;
  res.json({ success: true, updated: activeCampaigns });
});

module.exports = router;

