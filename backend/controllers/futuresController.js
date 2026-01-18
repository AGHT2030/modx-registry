
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

// © 2025 AG Holdings | Futures Controller
const Futures = require("../models/FuturesModel");
const ETF = require("../models/ETFModel");

// Create Futures Contract
exports.createFutures = async (req, res) => {
    try {
        const contract = await Futures.create(req.body);
        res.status(201).json(contract);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get Futures List
exports.getFutures = async (_req, res) => {
    const futures = await Futures.find().populate("etfRef");
    res.json(futures);
};

// Mark to Market Update
exports.updateFuturesPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const contract = await Futures.findByIdAndUpdate(id, req.body, { new: true });
        res.json(contract);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Compliance Audit Trail
exports.getComplianceTrail = async (_req, res) => {
    const futures = await Futures.find().populate("etfRef", "symbol name manager");
    const trail = futures.map(f => ({
        contract: f.contractSymbol,
        etf: f.etfRef?.symbol,
        complianceEntity: f.manager.complianceEntity,
        expiry: f.expiryDate,
        leverage: f.leverage,
        lastPrice: f.lastPrice,
    }));
    res.json({
        trail,
        auditor: "Aimal Global Holdings Trust – Compliance Division",
        oversight: "BLC Equity Fund / BLC Foundation",
    });
};
