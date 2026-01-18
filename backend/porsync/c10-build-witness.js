
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

/**
 * Builds the input.json for zk witness creation
 */

const fs = require("fs");
const path = require("path");

const POR_LOG = path.join(__dirname, "proof-of-reserves.json");

function buildWitnessInput() {
    const logs = JSON.parse(fs.readFileSync(POR_LOG, "utf8"));
    const latest = logs[logs.length - 1];

    const input = {
        reserve_xrpl: latest.backing.xrplReserves,
        reserve_bank: latest.backing.bankReserves,
        supply: latest.supply
    };

    fs.writeFileSync(
        path.join(__dirname, "input.json"),
        JSON.stringify(input, null, 2)
    );

    console.log("✅ input.json created for zk witness:", input);
}

buildWitnessInput();
