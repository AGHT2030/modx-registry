
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

﻿// © 2025 Mia Lopez | CoinPurse™ ETF Manager
// Merged with AG Holdings MODX Ecosystem ETF Controller
// Includes Ethers v5/v6 hybrid provider + BLC Equity Fund compliance integration

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { getProvider, ethers } = require("../utils/loadEthers");
const ETF = require("../models/ETFModel");
const ctrl = require("../controllers/etfController");

dotenv.config({ path: process.env.ENV_PATH || ".env.dev" });

// 🧩 Environment + Provider Loader
console.log("✅ ETFManager environment loaded from:", process.env.ENV_PATH || ".env.dev");

// ✅ Initialize universal provider (auto-handles v5/v6)
let provider;
try {
    provider = getProvider();
    if (provider) {
        console.log("🌐 Provider initialized successfully for ETF routes.");
    } else {
        console.warn("⚠️ Provider unavailable — RPC or network config missing.");
    }
} catch (err) {
    console.error("💥 ETF provider init error:", err.message);
    provider = null;
}

// ─────────────────────────────────────────────
// 🔹 Health / Status Route
// ─────────────────────────────────────────────
router.get("/status", async (req, res) => {
    try {
        if (!provider) throw new Error("Provider unavailable.");
        const block = await provider.getBlockNumber();

        res.json({
            success: true,
            network: process.env.NETWORK_NAME || "polygon",
            latestBlock: block,
            complianceEntity: "Aimal Global Holdings Trust",
            manager: "BLC Equity Fund",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("ETF /status error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─────────────────────────────────────────────
// 🪙 ETF Core Endpoints (with Compliance Tracking)
// ─────────────────────────────────────────────

// ➤ Create new ETF
router.post("/", ctrl.createETF);

// ➤ Fetch all ETFs
router.get("/", ctrl.getETFs);

// ➤ Update NAV / AUM for specific ETF
router.put("/:id", ctrl.updateETF);

// ➤ Generate BLC Compliance Report
router.get("/compliance/report", ctrl.getComplianceReport);

// ─────────────────────────────────────────────
// 🧩 Live NAV Simulation Endpoint (for testing or investor dashboards)
// ─────────────────────────────────────────────
router.get("/nav/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;
        const etf = await ETF.findOne({ symbol: symbol.toUpperCase() });
        if (!etf) return res.status(404).json({ error: "ETF not found" });

        // Mock on-chain NAV calculation for demo/testing
        const randomDrift = 1 + (Math.random() - 0.5) / 10; // ±5%
        const simulatedNAV = parseFloat((etf.nav * randomDrift).toFixed(4));

        res.json({
            success: true,
            symbol: etf.symbol,
            name: etf.name,
            currentNAV: simulatedNAV,
            lastRecordedNAV: etf.nav,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("ETF /nav error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─────────────────────────────────────────────
// 🧾 Trust Compliance Integration (Audit Hook)
// ─────────────────────────────────────────────
router.get("/audit", async (req, res) => {
    try {
        const etfs = await ETF.find().select("symbol name totalAUM manager");
        const report = {
            generated: new Date().toISOString(),
            overseenBy: "Aimal Global Holdings Trust – Internal Compliance Officer",
            consultant: "Third-Party Compliance Consultant",
            equityFund: "BLC Equity Fund",
            data: etfs,
        };
        res.json({ success: true, report });
    } catch (err) {
        console.error("ETF /audit error:", err.message);
        res.status(500).json({
            success: false,
            error: "Audit generation failed",
            details: err.message,
        });
    }
});

module.exports = router;
