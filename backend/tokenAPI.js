
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
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const SECRET_KEY = "super_secret_key_123";

// External modules
const promoPricing = require("./promotionPricing");
const { verifyCoinPursePayment } = require("./coinPursePaymentVerifier");
const { logCampaignEvent } = require("./promotionLogger");

// In-memory store to limit token redemptions per campaign (reset hourly or move to DB)
const redemptionLimits = {};
const MAX_REDEMPTIONS_PER_CAMPAIGN = 100; // Example threshold

// Admin-controlled campaign activations
let activeCampaigns = {
  grizzlies_promo: true,
  meta_concert: true,
  default: true,
};

// Admin route to toggle campaign status
app.post("/admin/campaign-toggle", (req, res) => {
  const { campaignName, active } = req.body;
  activeCampaigns[campaignName] = active;
  res.json({ success: true, updated: activeCampaigns });
});

// Token generation endpoint
app.post("/generate-token", (req, res) => {
  const { campaignName, userId, coinType, isNonprofit } = req.body;

  if (!activeCampaigns[campaignName]) {
    return res
      .status(403)
      .json({ error: "Campaign is inactive or not found." });
  }

  // Enforce redemption limits
  redemptionLimits[campaignName] = redemptionLimits[campaignName] || 0;
  if (redemptionLimits[campaignName] >= MAX_REDEMPTIONS_PER_CAMPAIGN) {
    return res
      .status(429)
      .json({ error: "Redemption limit reached for campaign." });
  }

  const pricing = promoPricing[campaignName] || promoPricing["default"];
  const discount = isNonprofit ? 0.5 : 1;
  const cost = pricing.cost * discount;

  const paid = verifyCoinPursePayment(userId, coinType, cost);
  if (!paid) {
    return res.status(402).json({ error: "Payment required or failed." });
  }

  const payload = { campaignName, userId, timestamp: new Date().toISOString() };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "60s" });

  redemptionLimits[campaignName]++;

  logCampaignEvent({ campaignName, userId, coinType, cost, isNonprofit });

  res.json({ token });
});

// Verify token
app.get("/verify-token/:token", (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ valid: true, data: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Invalid or expired token." });
  }
});

app.listen(PORT, () => {
  console.log(`Token API running on http://localhost:${PORT}`);
});

