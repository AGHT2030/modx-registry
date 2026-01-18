
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

// © 2025 AIMAL Global Holdings | vaultWriter.cjs
// Handles secure writes into the AGVault directory structure

const fs = require("fs");
const path = require("path");
const { logEvent } = require("../hooks/useLogger.cjs");
const { resolveVaultPath } = require("../hooks/useVaultPaths.cjs");

/**
 * Writes a JSON or text file into the vault.
 * @param {string} category - Subfolder (e.g., 'projects', 'contracts')
 * @param {string} filename - File name to write
 * @param {object|string} data - JSON object or raw string
 */
async function writeVaultFile(category, filename, data) {
    try {
        const vaultBase =
            process.env.AGH_VAULT_PATH ||
            "C:\\Users\\mialo\\AGVault\\investment";

        const dir = path.join(vaultBase, category);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, filename);
        const content =
            typeof data === "string" ? data : JSON.stringify(data, null, 2);

        fs.writeFileSync(filePath, content, "utf8");

        logEvent("info", "Vault write successful", { category, filename });
        return { ok: true, filePath };
    } catch (err) {
        logEvent("error", "Vault write failed", { message: err.message });
        return { ok: false, error: err.message };
    }
}

module.exports = { writeVaultFile };

