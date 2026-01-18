
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\nimport express from "express";
import { getYields, addYield } from "../controllers/modfarm.controller.js";
const router = express.Router();

router.get("/yields", getYields);
router.post("/update", addYield);

// Mock data for now — replace with live farm yields or blockchain queries
const yields = [
    { crop: "Soybeans", yield: 420, location: "TN Field 7" },
    { crop: "Corn", yield: 310, location: "MS Farm 2" },
    { crop: "Cotton", yield: 185, location: "AR Delta Zone" },
];

router.get("/yields", (req, res) => res.json(yields));

router.post("/update", (req, res) => {
    // Save to DB or blockchain later
    res.json({ success: true, message: "MODFARM data received." });
});
import express from "express";
import { getSensorData, addSensorReading } from "../controllers/modwtr.controller.js";

// GET: Retrieve all sensor readings (water flow, pressure, etc.)
router.get("/data", getSensorData);

// POST: Add a new IoT sensor reading
router.post("/update", addSensorReading);

export default router;

\nmodule.exports = router;


