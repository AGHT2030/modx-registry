
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

const fs = require("fs");
const path = require("path");

module.exports = function loadDilithium() {
    const keyPath = path.join(__dirname, "..", "keys", "dilithium5.private");
    const wasmPath = path.join(__dirname, "..", "wasm", "dilithium5.wasm");

    return {
        key: fs.readFileSync(keyPath),
        wasm: fs.readFileSync(wasmPath),
    };
};
