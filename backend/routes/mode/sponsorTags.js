
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// 📁 routes/mode/sponsorTags.js
// © 2025 AGH | MODE Sponsor Tagging System + Canva x MODA NFT Support

const express = require("express");
const router = express.Router();
const SponsorTag = require("../../models/SponsorTag");
const auditLog = require("../../utils/auditLog");

// 🏷️ POST /mode/sponsor-tags — Add a new sponsor tag with NFT + Canva support
router.post("/", async (req, res) => {
  try {
    const {
      eventId,
      sponsorId,
      zoneLabel,
      mediaType, // 'image', 'video', 'nft', 'interactive'
      assetUrl,
      duration,
      createdBy, // student, AI, or system
      attribution, // student name or ID if Canva-generated
      splitContract, // optional: charity payment splitter address
      description, // optional: brief label or exhibit name
    } = req.body;

    // Input validation
    if (!eventId || !sponsorId || !zoneLabel || !mediaType || !assetUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tag = await SponsorTag.create({
      eventId,
      sponsorId,
      zoneLabel,
      mediaType,
      assetUrl,
      duration,
      createdBy,
      attribution,
      splitContract,
      description,
    });

    // Log for sponsor & audit tracking
    auditLog("🖼️ Sponsor Tag Created", {
      eventId,
      sponsorId,
      zoneLabel,
      mediaType,
      createdBy,
      attribution,
      splitContract,
    });

    res.json({ success: true, tag });
  } catch (err) {
    console.error("Sponsor tagging error:", err);
    res.status(500).json({ error: "Unable to create sponsor tag" });
  }
});

module.exports = router;



