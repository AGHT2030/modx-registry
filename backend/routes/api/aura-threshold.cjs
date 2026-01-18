
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

// © 2025 Mia Lopez | AURA Threshold API Route
// --------------------------------------------------
// Provides REST + real-time control for AURA shimmer,
// cooldown, and rainbow visualization settings.
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const { loadConfig, saveConfig, resetConfig } = require("../../modules/aura-threshold");
const { io } = require("../../modules/aura-spectrum");

// --------------------------------------------------
// 🔹 GET current AURA visual configuration
// --------------------------------------------------
router.get("/", (req, res) => {
    try {
        const config = loadConfig();
        res.json(config);
    } catch (err) {
        console.error("⚠️ Failed to load AURA visual config:", err);
        res.status(500).json({ error: "Failed to load configuration" });
    }
});

// --------------------------------------------------
// 🔹 POST — update shimmerThreshold / cooldown / duration / rainbow
// --------------------------------------------------
router.post("/", express.json(), (req, res) => {
    try {
        const updated = saveConfig(req.body, io); // includes broadcast
        res.json(updated);
    } catch (err) {
        console.error("❌ Failed to update AURA config:", err);
        res.status(500).json({ error: "Failed to update configuration" });
    }
});

// --------------------------------------------------
// 🔹 POST — reset config to defaults
// --------------------------------------------------
router.post("/reset", (req, res) => {
    try {
        const reset = resetConfig(io);
        res.json(reset);
    } catch (err) {
        console.error("❌ Failed to reset AURA config:", err);
        res.status(500).json({ error: "Failed to reset configuration" });
    }
});

module.exports = router;
