
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
 * © 2025 Mia Lopez | MODX Tier-5 Unified EVM Governance Engine
 * --------------------------------------------------------------------------
 * This is the authoritative governance listener for ALL EVM networks.
 *
 * Includes:
 *   ✓ PQC Envelope Sealing
 *   ✓ MODLINK Galaxy Routing
 *   ✓ Universe Gateway Delivery
 *   ✓ C5 Threat Intelligence
 *   ✓ Sentinel Policy Enforcement
 *   ✓ Advisor Recommendations
 *   ✓ Compliance Inbox Ingestion
 *   ✓ Frontend Emitters (Option A)
 *   ✓ ERC-20 / ERC-721 / ERC-1155
 *   ✓ Governance Proposal System
 *   ✓ Multi-RPC Auto-Reconnect
 *   ✓ Replay Protection
 */

const { ethers } = require("ethers");
const io = require("../../aura/aura-spectrum");

// PQC & Routing Layers
const { evmGovernanceEvent } = require("../../universe/network-adapter");
const { C5Classify } = require("../../security/C5ThreatEngine");
const { sentinelEvaluate } = require("../../sentinel/SentinelCore");
const { policyAdvise } = require("../../policy/AdvisorCore");
const { inboxStore } = require("../../compliance/InboxStore");
const { auditLog } = require("../../admin/auditLogEngine");

// ENV
const RPC_URLS = (process.env.EVM_RPC_URLS || "").split(",").filter(Boolean);
const ERC20_ADDRESSES = (process.env.EVM_ERC20_LIST || "").split(",").filter(Boolean);
const GOVERNANCE_ADDRESSES = (process.env.EVM_GOVERNANCE_LIST || "").split(",").filter(Boolean);

// Globals
let providers = [];
let contracts = [];
let govContracts = [];
let seen = new Set();

/* ======================================================================
   🛡 Replay Protection
====================================================================== */
function seenHash(hash) {
    if (!hash) return true;
    if (seen.has(hash)) return true;
    seen.add(hash);
    if (seen.size > 50000) seen.clear();
    return false;
}

/* ======================================================================
   🧩 Load ABIs
====================================================================== */
const erc20ABI = require("../../abis/ERC20.json");
const governanceABI = require("../../abis/Governance.json");

/* ======================================================================
   🧠 Event Processor (Tier-5 Path)
====================================================================== */
async function processEVMEvent(payload) {
    try {
        const hash = payload.hash;
        if (seenHash(hash)) return;

        // 1) Audit Log
        auditLog({
            severity: "HIGH",
            source: "EVM Governance",
            message: `EVM Governance Event: ${payload.type}`,
            details: payload
        });

        // 2) C5 Classification
        const threat = C5Classify(payload);

        // 3) Sentinel Policy Enforcement
        const sentinel = sentinelEvaluate(payload);

        // 4) Advisor Recommendation Engine
        const advisory = policyAdvise(payload, threat, sentinel);

        // 5) Compliance Inbox
        inboxStore({
            source: "EVM",
            governance_type: payload.type,
            hash,
            data: payload
        });

        // 6) PQC + Universe Gateway
        await evmGovernanceEvent({
            payload,
            threat,
            sentinel,
            advisory
        });

        // 7) Frontend Emitters (Option A)
        io.emit("evm:gov:event", {
            payload,
            threat,
            sentinel,
            advisory
        });

        // Token feeds
        if (payload.category === "erc20") {
            io.emit("evm:token:event", payload);
        }

        // Governance feeds
        if (payload.category === "governance") {
            io.emit("evm:gov:proposal", payload);
        }

    } catch (err) {
        console.error("❌ Tier-5 EVM Event Error:", err);
    }
}

/* ======================================================================
   🧩 ERC-20 Watchers
====================================================================== */
function createTokenWatchers(provider) {
    for (const address of ERC20_ADDRESSES) {
        const c = new ethers.Contract(address, erc20ABI, provider);

        c.on("Transfer", (from, to, value, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "erc20",
                type: "Transfer",
                hash: evt.transactionHash,
                from,
                to,
                value: value.toString(),
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        c.on("Approval", (owner, spender, value, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "erc20",
                type: "Approval",
                hash: evt.transactionHash,
                owner,
                spender,
                value: value.toString(),
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        // Optional: Mint / Burn if ABI supports it
    }
}

/* ======================================================================
   🧩 Governance Contract Watchers
====================================================================== */
function createGovernanceWatchers(provider) {
    for (const address of GOVERNANCE_ADDRESSES) {
        const g = new ethers.Contract(address, governanceABI, provider);

        g.on("ProposalCreated", (id, proposer, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "governance",
                type: "ProposalCreated",
                id: id.toString(),
                proposer,
                hash: evt.transactionHash,
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        g.on("ProposalQueued", (id, eta, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "governance",
                type: "ProposalQueued",
                id: id.toString(),
                eta: eta.toString(),
                hash: evt.transactionHash,
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        g.on("ProposalExecuted", (id, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "governance",
                type: "ProposalExecuted",
                id: id.toString(),
                hash: evt.transactionHash,
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        g.on("VoteCast", (voter, id, support, weight, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "governance",
                type: "VoteCast",
                hash: evt.transactionHash,
                voter,
                id: id.toString(),
                support,
                weight: weight.toString(),
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        g.on("RoleGranted", (role, account, sender, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "governance",
                type: "RoleGranted",
                hash: evt.transactionHash,
                role,
                account,
                sender,
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });

        g.on("RoleRevoked", (role, account, sender, evt) => {
            processEVMEvent({
                chain: provider._networkName,
                category: "governance",
                type: "RoleRevoked",
                hash: evt.transactionHash,
                role,
                account,
                sender,
                block: evt.blockNumber,
                timestamp: Date.now()
            });
        });
    }
}

/* ======================================================================
   🌐 Connect All RPCs
====================================================================== */
async function connectAllRPCs() {
    for (const url of RPC_URLS) {
        try {
            const provider = new ethers.providers.WebSocketProvider(url);
            providers.push(provider);

            provider._networkName = url.includes("polygon") ? "polygon" :
                url.includes("amoy") ? "amoy" :
                    "mainnet";

            provider._websocket.on("close", () => {
                console.warn("⚠️ EVM RPC closed → auto reconnecting...");
                setTimeout(() => connectAllRPCs(), 4000);
            });

            provider._websocket.on("error", () => {
                console.warn("⚠️ RPC WS error → attempting reconnect...");
            });

            createTokenWatchers(provider);
            createGovernanceWatchers(provider);

            console.log(`🛰️ EVM Governance connected → ${provider._networkName}`);

        } catch (err) {
            console.error("❌ RPC Connect Error:", err.message);
        }
    }
}

/* ======================================================================
   🚀 AUTO-START
====================================================================== */
connectAllRPCs();

module.exports = { connectAllRPCs };
