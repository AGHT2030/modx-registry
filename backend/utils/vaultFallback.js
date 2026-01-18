
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

// © 2025 AIMAL Global Holdings | MODLINK Vault Fallback
// Provides safe fallback when /backend/modlink/vault.json is missing or unreadable

const fs = require("fs");
const path = require("path");

function loadVault() {
    const primaryPath = path.resolve(__dirname, "../modlink/vault.json");
    try {
        if (fs.existsSync(primaryPath)) {
            const data = JSON.parse(fs.readFileSync(primaryPath, "utf8"));
            // Ensure all essential keys exist
            return {
                network: data.network || "polygon-mainnet",
                version: data.version || "1.0.0",
                lastUpdated: data.lastUpdated || new Date().toISOString(),
            };
        }
    } catch (err) {
        console.warn("⚠️ Vault load error:", err.message);
    }

    // 🔒 Silent fallback (no console spam)
    return {
        network: "polygon-mainnet",
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
    };
}

module.exports = loadVault();
