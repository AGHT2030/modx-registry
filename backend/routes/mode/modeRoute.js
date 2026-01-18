
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// © 2025 Mia Lopez | MODE Routes
import express from "express";
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
} from "../../controllers/mode/mode.controller.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
ode 
\nmodule.exports = router;


