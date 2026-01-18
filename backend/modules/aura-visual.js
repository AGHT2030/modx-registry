
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
// Allows dynamic tuning of shimmer sensitivity, duration,
// and rainbow activation — with persistent configuration
// and real-time Socket.IO broadcast synchronization.
// --------------------------------------------------

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Resolve path for configuration file
const CONFIG_PATH = path.resolve(__dirname, "../../data/aura-visual.json");

// Default configuration (auto-generated if missing)
const defaultConfig = {
    shimmerThreshold: 190,   // Voice burst trigger level (0–255)
    shimmerCooldown: 1000,   // ms between activations
    shimmerDuration: 600,    // ms shimmer visual duration
    enableRainbow: true,     // Enable rainbow shimmer effect
};

// --------------------------------------------------
// 🧠 Load Configuration
// --------------------------------------------------
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, "utf8");
            const parsed = JSON.parse(data);
            return { ...defaultConfig, ...parsed };
        } else {
            fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
            console.log(chalk.yellow("🆕 AURA visual config created with defaults."));
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

        fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));

        console.log(chalk.green("✅ AURA visual config updated:"), updated);

        // Optional broadcast if Socket.IO instance passed
        if (io) {
            io.emit("aura-threshold-update", updated);
            console.log(chalk.cyan("📡 Broadcasted live AURA threshold update."));
        }

        return updated;
    } catch (err) {
        console.error(chalk.red("❌ Failed to save AURA visual config:"), err);
        return null;
    }
}

// --------------------------------------------------
// ♻️ Reset to Default Configuration
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
// 📦 Export Interface
// --------------------------------------------------
module.exports = {
    CONFIG_PATH,
    loadConfig,
    saveConfig,
    resetConfig,
};
