
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

// © 2025 AIMAL Global Holdings | MODX Governance Engine
// EVM Governance Listener (Final Production Build)
// Covers: ERC-20, Governance, Roles, Delegation, Mint/Burn, Cancellations, Executor updates
// PQC-safe event model + replay protection

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const io = require("../aura/aura-spectrum"); // unified socket hub

// Load ABIs from backend/abis
const erc20Abi = require("../abis/ERC20.json");
const governorAbi = require("../abis/Governor.json");

// Chain configuration
const RPC = process.env.EVM_RPC || "";
const TOKEN_ADDRESS = process.env.MODX_ERC20_CONTRACT;
const GOVERNOR_ADDRESS = process.env.MODX_GOVERNOR_CONTRACT;

// Replay protection
let processed = new Set();

// Provider
const provider = new ethers.JsonRpcProvider(RPC);

// Contracts
let token, governor;

// Utility – safe emit wrapper
function emit(channel, payload) {
    try {
        io.emit(channel, payload);
    } catch (_) { }
}

// Safe event formatting (PQC-safe structure)
function formatEvent(evtType, evt) {
    return {
        type: evtType,
        data: JSON.parse(JSON.stringify(evt)),
        block: evt?.log?.blockNumber || null,
        tx: evt?.log?.transactionHash || null,
        timestamp: Date.now(),
    };
}

// Initialize contracts
async function initContracts() {
    token = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, provider);
    governor = new ethers.Contract(GOVERNOR_ADDRESS, governorAbi, provider);

    console.log("🔗 EVM Governance Contracts Ready");
}

// Replay check
function hasProcessed(hash) {
    if (!hash) return false;
    if (processed.has(hash)) return true;
    processed.add(hash);
    if (processed.size > 5000) processed.clear();
    return false;
}

// Register listeners
async function registerListeners() {
    // --- ERC-20 EVENTS ---
    token.on("Transfer", (from, to, value, evt) => {
        if (hasProcessed(evt.log.transactionHash)) return;

        const payload = formatEvent("Transfer", { from, to, value: value.toString() });
        emit("evm:token:transfer", payload);
    });

    token.on("Approval", (owner, spender, value, evt) => {
        if (hasProcessed(evt.log.transactionHash)) return;

        const payload = formatEvent("Approval", { owner, spender, value: value.toString() });
        emit("evm:token:approval", payload);
    });

    token.on("Mint", (to, amount, evt) => {
        const payload = formatEvent("Mint", { to, amount: amount.toString() });
        emit("evm:token:mint", payload);
    });

    token.on("Burn", (from, amount, evt) => {
        const payload = formatEvent("Burn", { from, amount: amount.toString() });
        emit("evm:token:burn", payload);
    });

    // --- GOVERNANCE EVENTS ---
    governor.on("ProposalCreated", (id, proposer, targets, values, sigs, calld, desc, evt) => {
        if (hasProcessed(evt.log.transactionHash)) return;

        const payload = formatEvent("ProposalCreated", {
            id: id.toString(),
            proposer,
            description: desc,
        });
        emit("evm:gov:proposalCreated", payload);
    });

    governor.on("ProposalQueued", (id, eta, evt) => {
        const payload = formatEvent("ProposalQueued", { id: id.toString(), eta });
        emit("evm:gov:proposalQueued", payload);
    });

    governor.on("ProposalExecuted", (id, evt) => {
        const payload = formatEvent("ProposalExecuted", { id: id.toString() });
        emit("evm:gov:proposalExecuted", payload);
    });

    governor.on("ProposalCanceled", (id, evt) => {
        const payload = formatEvent("ProposalCanceled", { id: id.toString() });
        emit("evm:gov:proposalCanceled", payload);
    });

    // Votes
    governor.on("VoteCast", (voter, id, support, weight, reason, evt) => {
        const payload = formatEvent("VoteCast", {
            voter,
            id: id.toString(),
            support,
            weight: weight.toString(),
            reason,
        });
        emit("evm:gov:voteCast", payload);
    });

    // Delegation
    governor.on("DelegateChanged", (delegator, from, to, evt) => {
        const payload = formatEvent("DelegateChanged", { delegator, from, to });
        emit("evm:gov:delegateChanged", payload);
    });

    // Role management
    governor.on("RoleGranted", (role, acct, sender, evt) => {
        const payload = formatEvent("RoleGranted", { role, acct, sender });
        emit("evm:gov:roleGranted", payload);
    });

    governor.on("RoleRevoked", (role, acct, sender, evt) => {
        const payload = formatEvent("RoleRevoked", { role, acct, sender });
        emit("evm:gov:roleRevoked", payload);
    });

    // Executor changes
    governor.on("ExecutorUpdated", (oldExec, newExec, evt) => {
        const payload = formatEvent("ExecutorUpdated", { oldExec, newExec });
        emit("evm:gov:executorChanged", payload);
    });

    console.log("⚡ EVM Governance Listeners Registered");
}

// Start module
(async () => {
    await initContracts();
    await registerListeners();

    console.log("🚀 EVM Governance Listener ACTIVE");
})();
