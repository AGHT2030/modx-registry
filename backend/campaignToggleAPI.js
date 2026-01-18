
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
const fs = require("fs");
const path = require("path");
const router = express.Router();

const CAMPAIGN_FILE = path.resolve(__dirname, "../../campaigns.json");

// Helper to read campaigns
function readCampaigns() {
  if (!fs.existsSync(CAMPAIGN_FILE)) return {};
  return JSON.parse(fs.readFileSync(CAMPAIGN_FILE, "utf8"));
}

// Helper to write campaigns
function writeCampaigns(data) {
  fs.writeFileSync(CAMPAIGN_FILE, JSON.stringify(data, null, 2));
}

// GET all campaigns
router.get("/campaigns", (req, res) => {
  const campaigns = readCampaigns();
  res.json(campaigns);
});

// POST to toggle a campaign's active state
router.post("/toggle-campaign", (req, res) => {
  const { campaignName, active } = req.body;
  const campaigns = readCampaigns();
  campaigns[campaignName] = { ...campaigns[campaignName], active };
  writeCampaigns(campaigns);
  res.json({ message: "Campaign updated", campaign: campaigns[campaignName] });
});

module.exports = router;

