
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

// © 2025 Mia Lopez | CoinPurse™ AIRS Ride Service API
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.dev" });

console.log("✅ AIRS Ride environment loaded from:", process.env.ENV_PATH || ".env.dev");

// 🧩 Unified Ethers v5/v6 Provider Loader
let provider;
try {
    if (ethers.JsonRpcProvider) {
        console.log("🧩 Ethers v6 JsonRpcProvider active (AIRS)");
        provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://polygon-rpc.com");
    } else {
        console.log("🧩 Ethers v5 Provider fallback (AIRS)");
        provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "https://polygon-rpc.com");
    }
} catch (err) {
    console.error("💥 AIRS Provider init error:", err.message);
}

// 🔹 Test route
router.get("/ping", async (req, res) => {
    try {
        const block = await provider.getBlockNumber();
        res.json({ success: true, network: "polygon", block });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;







