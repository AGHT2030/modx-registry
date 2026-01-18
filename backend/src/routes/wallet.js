
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

// © 2025 AIMAL Global Holdings | CoinPurse Wallet Route
// Provides wallet info, on-chain balance, and linked MODX token data

const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const logger = require("../../../logger");

// optional: import your wallet util if exists
// const { getWallet } = require("../../modlink/walletManager");

const WALLET_ADDRESS =
    process.env.COINPURSE_WALLET ||
    "0x197440Eab222f24a2C390f7eBb781A1Bf3d61F0c"; // fallback
const RPC_URL =
    process.env.RPC_URL || "https://polygon-rpc.com"; // adjust as needed

// 📈 GET /api/wallet/info
// Returns address, network, and balance
router.get("/info", async (req, res) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const balance = await provider.getBalance(WALLET_ADDRESS);
        const balanceEth = ethers.utils.formatEther(balance);

        res.json({
            status: "ok",
            address: WALLET_ADDRESS,
            network: "polygon",
            balance: balanceEth,
        });
    } catch (err) {
        logger.error("❌ Wallet info retrieval failed:", err);
        res.status(500).json({ error: "Wallet info retrieval failed" });
    }
});

// 🔍 GET /api/wallet/verify?address=0x...
// Confirms if a given address matches the main wallet
router.get("/verify", (req, res) => {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: "Address required" });
    const match =
        address.toLowerCase() === WALLET_ADDRESS.toLowerCase() ? true : false;
    res.json({ match, mainWallet: WALLET_ADDRESS });
});

// 💬 Health check
router.get("/ping", (req, res) => {
    res.json({ status: "ok", message: "CoinPurse wallet route active" });
});

module.exports = router;
