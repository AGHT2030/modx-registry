
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

// backend/security/security.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./security.controller");

const verifyLicenseKey = require("./middleware/verifyLicenseKey");
const verifyRSASignature = require("./middleware/verifySignature");
const antiReplay = require("./middleware/antiReplay");
const deviceCheck = require("./middleware/deviceCheck");
const rateLimiter = require("./rateLimiter");

// GLOBAL PROTECTION WALL
router.use(verifyLicenseKey);
router.use(rateLimiter);
router.use(antiReplay);
router.use(deviceCheck);

// ROUTES
router.get("/keys", controller.getActiveKeys);
router.post("/rotate", verifyRSASignature, controller.rotateKey);
router.post("/device/ban", controller.banDevice);
router.get("/device/list", controller.listDevices);

module.exports = router;
