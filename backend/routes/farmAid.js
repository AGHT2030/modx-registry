
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

import express from "express";
import { processFarmAidRequest } from "../../../src/orbits/farm/farmAid/farmAid_API.js";
import { broadcastFarmAid } from "../../universe/UniverseTelemetry.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const result = await processFarmAidRequest(req.body);

        // 🚨 Broadcast Universe Telemetry
        broadcastFarmAid(result.result);

        res.json(result);
    } catch (err) {
        console.error("❌ FARM AID ROUTE ERROR:", err);
        res.status(500).json({ error: "Failed to process claim" });
    }
});

export default router;
