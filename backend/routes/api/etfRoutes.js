
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

// ✅ backend/routes/etfRoutes.js
// © 2025 Mia Lopez | MODX ETF Manager API

const express = require("express");
const router = express.Router();
const path = require("path");
const ETFManager = require("../ETFManager");
const { ethers, getProvider } = require("../utils/loadEthers");
const provider = getProvider();

let protectRoutes;
try {
    const middlewarePath = path.resolve(__dirname, "../middleware/protectRoutes.js");
    const middleware = require(middlewarePath);
    protectRoutes = middleware.protectRoutes || middleware.default || middleware;
    console.log("✅ protectRoutes middleware loaded from:", middlewarePath);
} catch (err) {
    console.error("❌ protectRoutes not found:", err.message);
    protectRoutes = (req, res, next) => next();
}

router.post("/mint", protectRoutes, async (req, res) => {
    try {
        const { investor, etfType, amount } = req.body;
        const result = await ETFManager.mintETF({ investor, etfType, amount, provider });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/burn", protectRoutes, async (req, res) => {
    try {
        const { investor, etfType, amount } = req.body;
        const result = await ETFManager.burnETF({ investor, etfType, amount, provider });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/collateral", protectRoutes, async (req, res) => {
    try {
        const result = await ETFManager.getCollateralValue(provider);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

