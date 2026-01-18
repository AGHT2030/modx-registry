
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

// backend/modules/compliance/complianceSigner.js
const { ethers } = require("ethers");
const { getWallet } = require("../../wallet/seedManager");

async function loadComplianceSigner() {
    const wallet = await getWallet("complianceSigner"); // pulls from CoinPurse registry
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    return wallet.connect(provider);
}
module.exports = { loadComplianceSigner };
