
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

// © 2025 AIMAL Global Holdings | AURA Twin Awareness API
// Provides endpoints for updating, syncing, and inspecting twin states

const express = require("express");
const router = express.Router();
const { updateTwin, syncTwins, getTwinState } = require("../aura/twinSync");

router.get("/state", (req, res) => res.json(getTwinState()));

router.post("/update/:twin", (req, res) => {
    const { twin } = req.params;
    const { mood, context } = req.body;
    const updated = updateTwin(twin, { mood, context });
    res.json({ status: "ok", twin, updated });
});

router.post("/sync", (req, res) => {
    const result = syncTwins();
    res.json({ status: "ok", shared: result });
});

module.exports = router;
