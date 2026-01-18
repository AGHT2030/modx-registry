
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

// © 2025 AIMAL Global Holdings | MODLINK DAO Governance Auto-Sync
// Handles persistent write + live broadcast for galaxy registration.

import fs from "fs";
import path from "path";
import { io } from "../aura/aura-spectrum.js"; // Universe Gateway socket

const DATA_PATH = path.resolve("backend/modlink/modlinkGovernance.json");

// ✅ Ensure data file exists
if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ galaxies: [] }, null, 2));
    console.log("🆕 Created modlinkGovernance.json baseline file");
}

/**
 * Registers a new galaxy into governance persistence + emits live socket update.
 * @param {Object} galaxy - The galaxy data object to register.
 * @returns {Promise<Object>} Updated governance dataset.
 */
export async function registerGalaxy(galaxy) {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
        const exists = data.galaxies.some((g) => g.id === galaxy.id);

        if (!exists) {
            data.galaxies.push(galaxy);
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

            // 🌌 Emit live event to Universe Gateway
            if (io && io.emit) {
                io.emit("universe:galaxy:registered", galaxy);
                console.log(`✨ Galaxy registered + broadcasted: ${galaxy.name}`);
            } else {
                console.warn("⚠️ Universe Gateway socket not initialized.");
            }
        } else {
            console.log(`🔁 Galaxy already exists: ${galaxy.name}`);
        }

        return data;
    } catch (err) {
        console.error("❌ Error writing galaxy data:", err);
        throw err;
    }
}

/**
 * Reloads all galaxies on DAO boot (auto-sync on restart).
 * @returns {Array} List of reloaded galaxies.
 */
export function reloadGalaxies() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
        const { galaxies } = data;

        galaxies.forEach((g) => {
            if (io && io.emit) io.emit("universe:galaxy:registered", g);
        });

        console.log(`♻️ Reloaded ${galaxies.length} galaxies into Universe Gateway`);
        return galaxies;
    } catch (err) {
        console.error("⚠️ Failed to reload galaxies:", err);
        return [];
    }
}
