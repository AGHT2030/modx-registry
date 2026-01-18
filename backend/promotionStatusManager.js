
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
const path = require("path");

const statusFilePath = path.join(__dirname, "campaignStatus.json");

// Load campaign status from file or initialize
function loadCampaignStatus() {
  try {
    const data = fs.readFileSync(statusFilePath);
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Save campaign status to file
function saveCampaignStatus(status) {
  fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
}

module.exports = {
  loadCampaignStatus,
  saveCampaignStatus,
};

