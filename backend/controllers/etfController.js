
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

// © 2025 AG Holdings | ETF Controller
const ETF = require("../models/ETFModel");

// Create ETF
exports.createETF = async (req, res) => {
    try {
        const etf = await ETF.create(req.body);
        res.status(201).json(etf);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get All ETFs
exports.getETFs = async (_req, res) => {
    const etfs = await ETF.find().sort({ updatedAt: -1 });
    res.json(etfs);
};

// Update NAV / AUM
exports.updateETF = async (req, res) => {
    try {
        const { id } = req.params;
        const etf = await ETF.findByIdAndUpdate(id, req.body, { new: true });
        res.json(etf);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Compliance Report
exports.getComplianceReport = async (_req, res) => {
    const etfs = await ETF.find();
    const report = etfs.map(e => ({
        symbol: e.symbol,
        manager: e.manager.name,
        complianceEntity: e.manager.complianceEntity,
        consultant: e.manager.consultant,
        totalAUM: e.totalAUM,
        lastUpdated: e.updatedAt,
    }));
    res.json({
        report,
        auditor: "Aimal Global Holdings Trust – Compliance Division",
        oversight: "BLC Equity Fund / BLC Foundation",
    });
};
