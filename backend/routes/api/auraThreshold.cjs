
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

// © 2025 Mia Lopez | AURA Threshold API Route (with Live Broadcast)
// -------------------------------------------------------------------
// Reads and updates AURA shimmer / rainbow configuration
// and broadcasts updates via Socket.IO to all connected clients.
// Works with AuraControlPanel.jsx (frontend control panel) and
// Splash.jsx (live visual client).
// -------------------------------------------------------------------

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { loadConfig, saveConfig } = require("../../modules/aura-threshold.js");

// -----------------------------------------------------------
// 🧠 Local config file path
// -----------------------------------------------------------
const configPath = path.resolve(__dirname, "../../../config/aura-visual.json");

// -----------------------------------------------------------
// 🔹 Helper fallback (in case loadConfig module fails)
// -----------------------------------------------------------
function safeReadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, "utf8"));
        }
    } catch (err) {
        console.error("⚠️ Failed to read AURA visual config:", err);
    }
    return {
        shimmerThreshold: 190,
        shimmerCooldown: 1000,
        shimmerDuration: 600,
        enableRainbow: true,
    };
}

// -----------------------------------------------------------
// 🔹 GET — return current AURA visual configuration
// -----------------------------------------------------------
router.get("/", (req, res) => {
    try {
        const config = loadConfig ? loadConfig() : safeReadConfig();
        res.json(config);
    } catch (err) {
        console.error("⚠️ Error fetching AURA config:", err);
        res.status(500).json({ error: "Failed to load configuration" });
    }
});

// -----------------------------------------------------------
// 🔹 POST — update configuration & broadcast live
// -----------------------------------------------------------
router.post("/", express.json(), (req, res) => {
    try {
        const incoming = req.body || {};
        const config = loadConfig ? loadConfig() : safeReadConfig();

        // merge incoming values with existing config
        const updated = {
            ...config,
            ...incoming,
        };

        if (saveConfig) saveConfig(updated);
        else fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));

        console.log("🔄 AURA visual configuration updated:", updated);

        // 🟣 Broadcast via Socket.IO to all connected AURA clients
        if (global.io) {
            global.io.emit("aura-visual-update", updated);
            console.log("📡 Broadcasted AURA visual update to all clients.");
        } else {
            console.warn("⚠️ No global.io instance found — broadcast skipped.");
        }

        res.json(updated);
    } catch (err) {
        console.error("❌ Failed to update AURA configuration:", err);
        res.status(500).json({ error: "Failed to update configuration" });
    }
});

module.exports = router;
