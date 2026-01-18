
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

// © 2025 Mia Lopez | CREATV Hybrid Router
// 📺 Streaming, AI Media & Content Uploads

const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/creatvController");
const middleware = require("../../../middleware/creatvMiddleware");

router.get("/status", controller.status);
router.post("/upload", middleware.validateUpload, controller.upload);
router.post("/sync", controller.sync);

module.exports = router;
