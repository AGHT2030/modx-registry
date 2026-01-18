
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

// © 2025 Mia Lopez | MODX Universe Orb Loader
// Dynamically registers all backend modules ("orbs") into the global MODX_ORBS map.

const fs = require("fs");
const path = require("path");

module.exports = function registerOrbs(app) {
    const orbsDir = path.join(__dirname, "../..", "orbs");
    const orbMap = {};

    if (!fs.existsSync(orbsDir)) {
        console.warn("⚠️ No Orbs directory found — skipping dynamic orb registration.");
        global.MODX_ORBS = {};
        return {};
    }

    const files = fs.readdirSync(orbsDir);

    for (const file of files) {
        if (!file.endsWith(".json")) continue;

        try {
            const orbData = JSON.parse(
                fs.readFileSync(path.join(orbsDir, file), "utf8")
            );

            const key = orbData.key || file.replace(".json", "");

            orbMap[key] = {
                name: orbData.name || key,
                orbit: orbData.orbit || "unknown",
                url: orbData.url || null,
                status: "pending"
            };

            console.log(`🪐 Registered Orb: ${orbData.name} (${orbData.orbit})`);
        } catch (err) {
            console.error(`❌ Failed loading orb file ${file}:`, err.message);
        }
    }

    global.MODX_ORBS = orbMap;
    return orbMap;
};
