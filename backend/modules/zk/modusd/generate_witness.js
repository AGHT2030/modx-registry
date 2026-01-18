
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

// © 2025 AIMAL Global Holdings | MODUSD zk-Proof Generator

const fs = require("fs");
const wc = require("./witness_calculator.js");

module.exports = async function generateWitness(input) {
    const wasm = fs.readFileSync(__dirname + "/circuit.wasm");
    const witnessCalculator = await wc(wasm);

    const buff = await witnessCalculator.calculateWTNSBin(input, 0);
    return buff;
};
