"use strict";

/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * MODLINK Galaxy Auto-Sync Loader
 */

"use strict";

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const { setETFRegistry } =
    require("../universe/GalaxyRouter.js");

// --------------------------------------------------
// Load config
// --------------------------------------------------
function loadGalaxyConfig() {
    try {
        const raw = fs.readFileSync(
            path.join(__dirname, "modlinkGovernance.json"),
            "utf8"
        );
        const json = JSON.parse(raw);
        return Array.isArray(json.galaxies)
            ? json.galaxies.filter(g => g.enabled !== false)
            : [];
    } catch (err) {
        console.warn("⚠️ Galaxy config load failed:", err.message);
        return [];
    }
}

// --------------------------------------------------
// Register galaxies
// --------------------------------------------------
function registerGalaxies(dao, galaxies) {
    if (!dao || !Array.isArray(galaxies)) return;

    galaxies.forEach(g => {
        try {
            dao.registerGalaxy?.(g);
            console.log(`✅ Galaxy registered: ${g.id}`);
        } catch (err) {
            console.warn(`⚠️ Failed to register ${g.id}`, err.message);
        }
    });
}

// --------------------------------------------------
// 🌌 SINGLE AUTO-SYNC ENTRY (KEEP THIS ONE)
// --------------------------------------------------
function autoSync(modlinkDao) {
    const dao = modlinkDao || global.MODLINK?.dao;
    if (!dao) {
        console.warn("⚠️ Galaxy Auto-Sync: DAO not ready");
        return;
    }

    const galaxies = loadGalaxyConfig();
    registerGalaxies(dao, galaxies);

    if (dao.etfRegistry) {
        setETFRegistry(dao.etfRegistry);
        console.log("🌌 GalaxyRouter ETF registry injected");
    }
}

module.exports = {
    autoSync,
    loadGalaxyConfig,
    registerGalaxies
};
