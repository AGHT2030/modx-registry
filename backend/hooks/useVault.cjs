
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

// © 2025 AIMAL Global Holdings | Vault Hook Alias
// Wrapper to ensure backward compatibility for all vault writers.

const fs = require("fs");
const path = require("path");
const { logEvent } = require("./useLogger.cjs");

// Root path to AGVault storage
const VAULT_ROOT = path.resolve(process.cwd(), "AGVault/investment");

/**
 * Writes JSON data to the Vault by category.
 * @param {string} category - "projects", "contracts", or "fidelity"
 * @param {string} filename - target filename (should end in .json)
 * @param {object} data - payload to save
 * @returns {Promise<{ok: boolean, filePath: string}>}
 */
async function writeVaultFile(category, filename, data) {
    try {
        const dir = path.join(VAULT_ROOT, category);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

        logEvent("info", "Vault write successful", { category, filename });
        return { ok: true, filePath };
    } catch (err) {
        logEvent("error", "Vault write failed", { category, filename, message: err.message });
        throw err;
    }
}

module.exports = { writeVaultFile };
