
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

// © 2025 AIMAL Global Holdings | MODX Unified Governance Pipeline
// DAO → AURA Galaxy Event Bridge
// -------------------------------------------------------
// Watches all DAO contracts → sends structured governance
// updates into AURA Galaxy (port 8083) for the Twins,
// Sentinel, and Policy Advisor pipelines.

// Dependencies
const axios = require("axios");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

// -------------------------------------------------------
// CONFIG
// -------------------------------------------------------
const RPC_URL = process.env.POLYGON_RPC || "https://polygon-rpc.com";
const GALAXY_URL = process.env.AURA_GALAXY_URL || "http://localhost:8083";

const provider = new ethers.JsonRpcProvider(RPC_URL);

// DAO registry mapping
const DAO_REGISTRY_PATH = path.join(__dirname, "../../vault/daoLinks.json");

let registry = {};
try {
    registry = JSON.parse(fs.readFileSync(DAO_REGISTRY_PATH, "utf8"));
    console.log("🔑 DAO Registry Loaded:", registry);
} catch (err) {
    console.warn("⚠ DAO registry missing — using empty map.");
}

// Unified governance event emitter
class GovernanceBridge extends EventEmitter { }
const bridge = new GovernanceBridge();

// -------------------------------------------------------
// SEND EVENTS → AURA GALAXY
// -------------------------------------------------------
async function forwardToGalaxy(payload) {
    try {
        await axios.post(`${GALAXY_URL}/galaxy/event`, payload, {
            timeout: 2000
        });
        console.log("📡 [BRIDGE] Event forwarded to AURA Galaxy:", payload.type);
    } catch (err) {
        console.warn("⚠ [BRIDGE] Failed to forward to Galaxy, caching locally…");

        // Local fallback cache
        const cacheFile = path.join(__dirname, "../../vault/galaxyEventCache.json");
        const existing = fs.existsSync(cacheFile)
            ? JSON.parse(fs.readFileSync(cacheFile, "utf8"))
            : [];

        existing.push({
            payload,
            timestamp: Date.now(),
            error: err.message
        });

        fs.writeFileSync(cacheFile, JSON.stringify(existing, null, 2));
    }
}

// -------------------------------------------------------
// WATCH ALL DAO CONTRACTS
// -------------------------------------------------------
async function attachDaoWatcher(name, address) {
    if (!address || address === "0x0000000000000000000000000000000000000000") {
        console.warn(`⚠ Skipping DAO watcher: ${name} (no address)`);
        return;
    }

    console.log(`🛰️ Watching DAO: ${name} @ ${address}`);

    // Minimal ABI — governance events only
    const abi = [
        "event ProposalCreated(uint256 id, address proposer, string description)",
        "event ProposalExecuted(uint256 id)",
        "event VoteCast(address voter, uint256 proposalId, bool support, uint256 weight)"
    ];

    const contract = new ethers.Contract(address, abi, provider);

    // Proposal creation
    contract.on("ProposalCreated", (id, proposer, description) => {
        bridge.emit("governance", {
            type: "proposal_created",
            dao: name,
            id: id.toString(),
            proposer,
            description,
            timestamp: Date.now()
        });
    });

    // Proposal execution
    contract.on("ProposalExecuted", (id) => {
        bridge.emit("governance", {
            type: "proposal_executed",
            dao: name,
            id: id.toString(),
            timestamp: Date.now()
        });
    });

    // Voting event
    contract.on("VoteCast", (voter, proposalId, support, weight) => {
        bridge.emit("governance", {
            type: "vote_cast",
            dao: name,
            voter,
            proposalId: proposalId.toString(),
            support,
            weight: weight.toString(),
            timestamp: Date.now()
        });
    });
}

// -------------------------------------------------------
// PIPE → GALAXY
// -------------------------------------------------------
bridge.on("governance", async (event) => {
    console.log("🔄 Governance Event:", event);

    const payload = {
        ...event,
        chain: "polygon",
        source: "dao_bridge",
        severity: resolveSeverity(event),
    };

    await forwardToGalaxy(payload);
});

// -------------------------------------------------------
// AUTO-SEVERITY ENGINE
// -------------------------------------------------------
function resolveSeverity(event) {
    if (event.type === "proposal_executed") return "critical";
    if (event.type === "proposal_created") return "high";
    if (event.type === "vote_cast") return "info";
    return "unknown";
}

// -------------------------------------------------------
// INITIALIZE ALL WATCHERS
// -------------------------------------------------------
async function initDaoBridge() {
    console.log("🌉 Initializing DAO → AURA Galaxy Bridge…");

    for (const [name, address] of Object.entries(registry)) {
        await attachDaoWatcher(name, address);
    }

    console.log("🌉 DAO Bridge Online — all watchers active.");
}

// Run on import
initDaoBridge();

module.exports = {
    bridge,
    forwardToGalaxy
};
