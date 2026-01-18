
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

// backend/src/routes/aura/autopilotLogs.js
const express = require("express");
const router = express.Router();
const { getRecentAtmosphereLogs } = require("../../../aura/aiAutopilot");

router.get("/logs", (req, res) => {
    const data = getRecentAtmosphereLogs(150);
    res.json(data);
});

module.exports = router;
