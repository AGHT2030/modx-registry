
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

import MODBLU from "../models/MODBLU.model.js";

// ✅ Get ESG metrics
export async function getMetrics(req, res) {
    try {
        const metrics = await MODBLU.find().sort({ timestamp: -1 }).limit(50);
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ✅ Add new ESG report
export async function addReport(req, res) {
    try {
        const entry = new MODBLU(req.body);
        await entry.save();
        res.json({ success: true, entry });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

