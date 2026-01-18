
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

// © 2025 Mia Lopez | AURA Voice Threshold Controller
// --------------------------------------------------
// Centralized visual + threshold configuration handler
// with live broadcast support for shimmer sensitivity,
// cooldown, duration, and rainbow toggling.
// --------------------------------------------------

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Use existing config location for consistency
const CONFIG_PATH = path.resolve(__dirname, "../../config/aura-visual.json");

// Default configuration (auto-generated if missing)
const defaultConfig = {
    shimmerThreshold: 190,   // Voice burst trigger level (0–255)
    shimmerCooldown: 1000,   // ms between shimmer activations
    shimmerDuration: 600,    // ms shimmer duration
    enableRainbow: true      // Enable rainbow shimmer
};

// --------------------------------------------------
// 🧠 Load Configuration
// --------------------------------------------------
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const fileData = fs.readFileSync(CONFIG_PATH, "utf8");
            const parsed = JSON.parse(fileData);
            return { ...defaultConfig, ...parsed };
        } else {
            fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
            console.log(chalk.yellow("🆕 Created default AURA visual config."));
            return { ...defaultConfig };
        }
    } catch (err) {
        console.error(chalk.red("⚠️ Failed to load AURA visual config:"), err);
        return { ...defaultConfig };
    }
}

// --------------------------------------------------
// 💾 Save Configuration + Optional Socket Broadcast
// --------------------------------------------------
function saveConfig(newConfig = {}, io = null) {
    try {
        const current = loadConfig();
        const updated = { ...current, ...newConfig };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
        console.log(chalk.green("✅ AURA visual config updated:"), updated);

        // Live broadcast to all connected clients
        if (io) {
            io.emit("aura-threshold-update", updated);
            console.log(chalk.cyan("📡 Broadcasted live AURA config update."));
        }

        return updated;
    } catch (err) {
        console.error(chalk.red("❌ Failed to save AURA visual config:"), err);
        return null;
    }
}

// --------------------------------------------------
// ♻️ Reset to Defaults + Broadcast
// --------------------------------------------------
function resetConfig(io = null) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
        console.log(chalk.yellowBright("♻️ AURA visual config reset to defaults."));
        if (io) io.emit("aura-threshold-update", defaultConfig);
        return { ...defaultConfig };
    } catch (err) {
        console.error(chalk.red("❌ Failed to reset AURA visual config:"), err);
        return { ...defaultConfig };
    }
}

// --------------------------------------------------
// 📦 Exports
// --------------------------------------------------
module.exports = {
    CONFIG_PATH,
    loadConfig,
    saveConfig,
    resetConfig
};
