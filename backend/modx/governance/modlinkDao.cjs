
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

// © 2025 AIMAL Global Holdings | MODLINK DAO Adapter (CJS, ethers v5)
const { ethers } = require("ethers");

let provider, signer, dao;

const DAO_ABI = [
    // keep ABI tiny; extend later
    "function proposePolicy(bytes32 ruleId, string memo) public returns (uint256)",
    "function approvePolicy(uint256 proposalId) public returns (bool)",
    "function rejectPolicy(uint256 proposalId) public returns (bool)"
];

function getDao() {
    if (dao) return dao;

    const rpc = process.env.MODX_RPC || "https://polygon-rpc.com";
    const key = process.env.MODX_ADMIN_KEY; // ⚠️ set in .env.override
    const addr = process.env.MODLINK_DAO_ADDRESS; // your DAO contract

    provider = new ethers.providers.JsonRpcProvider(rpc);
    signer = key ? new ethers.Wallet(key, provider) : null;

    if (!addr) {
        console.warn("⚠️ MODLINK_DAO_ADDRESS not set — DAO calls disabled.");
        return null;
    }
    if (!signer) {
        console.warn("⚠️ MODX_ADMIN_KEY not set — DAO calls disabled (read-only).");
        return new ethers.Contract(addr, DAO_ABI, provider);
    }

    dao = new ethers.Contract(addr, DAO_ABI, signer);
    return dao;
}

async function proposePolicy(ruleIdStr, memo = "") {
    const c = getDao();
    if (!c || !c.signer) throw new Error("DAO not write-enabled.");
    const id = ethers.utils.formatBytes32String(ruleIdStr.substring(0, 31));
    const tx = await c.proposePolicy(id, memo);
    const rc = await tx.wait();
    // naive parse: assume first event contains proposalId
    const proposalId = rc?.events?.[0]?.args?.[0]?.toString?.() || "0";
    return { tx: tx.hash, proposalId };
}

async function approvePolicy(proposalId) {
    const c = getDao();
    if (!c || !c.signer) throw new Error("DAO not write-enabled.");
    const tx = await c.approvePolicy(proposalId);
    return (await tx.wait()).transactionHash;
}

async function rejectPolicy(proposalId) {
    const c = getDao();
    if (!c || !c.signer) throw new Error("DAO not write-enabled.");
    const tx = await c.rejectPolicy(proposalId);
    return (await tx.wait()).transactionHash;
}

module.exports = { getDao, proposePolicy, approvePolicy, rejectPolicy };
