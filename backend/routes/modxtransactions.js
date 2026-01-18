
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

﻿// ✅ backend/routes/modxtransactions.js
// © 2025 Mia Lopez | MODX Transaction API

const express = require("express");
const router = express.Router();
const path = require("path");
const MODXTransaction = require("../models/modxtransaction");
const { ethers, getProvider } = require("../utils/loadEthers");
const provider = getProvider();

// 🧭 Middleware loader
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

// 🧾 Create transaction
router.post("/", protectRoutes, async (req, res) => {
    try {
        const entry = new MODXTransaction(req.body);
        const saved = await entry.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Creation failed", error: err.message });
    }
});

// 📜 Get all or by wallet
router.get("/", protectRoutes, async (req, res) => {
    const { walletAddress } = req.query;
    const filter = walletAddress ? { walletAddress } : {};
    try {
        const txs = await MODXTransaction.find(filter).sort({ createdAt: -1 });
        res.json(txs);
    } catch (err) {
        res.status(500).json({ message: "Fetch failed", error: err.message });
    }
});

// 🔍 Get by ID
router.get("/:id", protectRoutes, async (req, res) => {
    try {
        const tx = await MODXTransaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ message: "Transaction not found" });
        res.json(tx);
    } catch (err) {
        res.status(500).json({ message: "Fetch failed", error: err.message });
    }
});

// 🔗 Verify on-chain by hash
router.get("/verify-chain/:hash", protectRoutes, async (req, res) => {
    try {
        const { hash } = req.params;
        if (!hash || !/^0x([A-Fa-f0-9]{64})$/.test(hash))
            return res.status(400).json({ error: "Invalid transaction hash" });

        const receipt = await provider.getTransactionReceipt(hash);
        if (!receipt)
            return res.status(404).json({ message: "Transaction not found or not mined yet" });

        res.json({
            hash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            status: receipt.status === 1 ? "✅ Success" : "❌ Failed",
            gasUsed: receipt.gasUsed.toString(),
            from: receipt.from,
            to: receipt.to,
            confirmations: receipt.confirmations,
        });
    } catch (err) {
        res.status(500).json({ message: "Verification failed", error: err.message });
    }
});

// 🔁 Extended verify by chain name
const { verifyChain } = require("../services/verifyChain");
router.get("/verify-chain/:chain/:txHash", protectRoutes, async (req, res) => {
    try {
        const { chain, txHash } = req.params;
        const result = await verifyChain({ chain, txHash });
        res.json({ success: true, chain, txHash, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;








