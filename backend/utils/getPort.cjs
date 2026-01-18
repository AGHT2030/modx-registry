
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

// © 2025 Mia Lopez | MODX Port Resolver Utility
// Compatible with CommonJS (server.js) and dynamic import fallback.

module.exports = async function resolvePort(preferred = 8080) {
    try {
        const mod = await import("get-port");
        const getPort = mod.default;
        const port = await getPort({ port: preferred });
        console.log(`✅ Resolved open port: ${port}`);
        return port;
    } catch (err) {
        console.error("❌ Port resolver failed:", err);
        return preferred;
    }
};
