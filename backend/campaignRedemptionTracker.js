
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

const fs = require("fs");
const path = "./campaign_redemptions.json";

// Load redemption data from file
function loadRedemptions() {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({}));
  }
  const data = fs.readFileSync(path);
  return JSON.parse(data);
}

// Save redemption data to file
function saveRedemptions(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// Increment redemption count for a campaign
function incrementRedemption(campaignName) {
  const redemptions = loadRedemptions();
  redemptions[campaignName] = (redemptions[campaignName] || 0) + 1;
  saveRedemptions(redemptions);
}

// Get redemption count
function getRedemptionCount(campaignName) {
  const redemptions = loadRedemptions();
  return redemptions[campaignName] || 0;
}

// Reset all redemptions (admin use only)
function resetRedemptions() {
  saveRedemptions({});
}

module.exports = {
  incrementRedemption,
  getRedemptionCount,
  resetRedemptions,
};

