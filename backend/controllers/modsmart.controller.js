
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

import MODSMART from "../models/MODSMART.model.js";

// ✅ Retrieve smart modular projects
export async function getProjects(req, res) {
    try {
        const projects = await MODSMART.find().sort({ timestamp: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ✅ Create a new smart project
export async function createProject(req, res) {
    try {
        const project = new MODSMART(req.body);
        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

