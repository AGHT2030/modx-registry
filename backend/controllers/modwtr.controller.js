
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

import MODWTR from "../models/MODWTR.model.js";

// ✅ Get all IoT sensor readings
export async function getSensorData(req, res) {
    try {
        const data = await MODWTR.find().sort({ timestamp: -1 }).limit(100);
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ✅ Add a new sensor reading
export async function addSensorReading(req, res) {
    try {
        const entry = new MODWTR(req.body);
        await entry.save();
        res.json({ success: true, entry });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

