
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

// © 2025 AG Holdings | Futures Routes
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/futuresController");

router.post("/", ctrl.createFutures);
router.get("/", ctrl.getFutures);
router.put("/:id", ctrl.updateFuturesPrice);
router.get("/compliance/trail", ctrl.getComplianceTrail);

module.exports = router;
