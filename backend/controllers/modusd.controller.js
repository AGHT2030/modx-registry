
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

import MODUSD from "../models/MODUSD.model.js";

export async function getStats(req, res) {
    const total = await MODUSD.find().sort({ timestamp: -1 }).limit(1);
    res.json(total[0] || { totalSupply: 0 });
}

export async function mintTokens(req, res) {
    try {
        const { amount, wallet } = req.body;
        const latest = await MODUSD.find().sort({ timestamp: -1 }).limit(1);
        const newTotal = (latest[0]?.totalSupply || 0) + Number(amount);
        const entry = new MODUSD({ action: "mint", amount, totalSupply: newTotal, wallet });
        await entry.save();
        res.json({ success: true, newTotal });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

