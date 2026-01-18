
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

// © 2025 Mia Lopez | AIRS Hybrid Router
// 🤖 AI Residential & Integrated Resource Services

const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/airsController");
const middleware = require("../../../middleware/airsMiddleware");

router.get("/status", controller.status);
router.post("/request", middleware.verifyRequest, controller.handleRequest);
router.post("/route", controller.handleRoute);

module.exports = router;
