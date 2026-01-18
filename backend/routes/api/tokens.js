
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

﻿// ✅ backend/routes/api/tokens.js
// © 2025 Mia Lopez | CoinPurse Token API

const express = require("express");
const router = express.Router();
const path = require("path");
const { ethers, getProvider } = require("../../utils/loadEthers");
const provider = getProvider();

let protectRoutes;
try {
    const middlewarePath = path.resolve(__dirname, "../../middleware/protectRoutes.js");
    const middleware = require(middlewarePath);
    protectRoutes = middleware.protectRoutes || middleware.default || middleware;
    console.log("✅ protectRoutes middleware loaded from:", middlewarePath);
} catch (err) {
    console.error("❌ protectRoutes missing:", err.message);
    protectRoutes = (req, res, next) => next();
}

// 🪙 Fetch basic token info
router.get("/:address", protectRoutes, async (req, res) => {
    try {
        const { address } = req.params;
        if (!ethers.utils.isAddress(address)) {
            return res.status(400).json({ error: "Invalid token address" });
        }

        const abi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)"
        ];
        const token = new ethers.Contract(address, abi, provider);

        const [name, symbol, decimals, totalSupply] = await Promise.all([
            token.name(),
            token.symbol(),
            token.decimals(),
            token.totalSupply()
        ]);

        res.json({
            address,
            name,
            symbol,
            decimals,
            totalSupply: totalSupply.toString()
        });
    } catch (err) {
        console.error("❌ Token fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 💰 Fetch wallet balance
router.get("/:address/balance/:wallet", protectRoutes, async (req, res) => {
    try {
        const { address, wallet } = req.params;
        if (!ethers.utils.isAddress(address) || !ethers.utils.isAddress(wallet)) {
            return res.status(400).json({ error: "Invalid address format" });
        }

        const abi = ["function balanceOf(address) view returns (uint256)"];
        const token = new ethers.Contract(address, abi, provider);
        const balance = await token.balanceOf(wallet);

        res.json({ address, wallet, balance: balance.toString() });
    } catch (err) {
        console.error("❌ Balance fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


