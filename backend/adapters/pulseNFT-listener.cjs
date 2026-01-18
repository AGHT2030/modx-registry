
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

// © 2025 AIMAL Global Holdings | MODX Governance Suite
// PulseNFT Governance Listener — feeds DAO events into Sentinel & Policy Advisor

const ethers = require("ethers"); // direct import
const dotenv = require("dotenv");
const chalk = require("chalk");
const { io } = require("../aura/aura-spectrum.js");
const { io: Client } = require("socket.io-client");

// 🧩 Load Environment
dotenv.config({ path: process.env.ENV_PATH || ".env.override" });

const {
    PULSE_CONTRACT,
    DAO_CONTRACT,
    INFURA_URL,
    SENTINEL_SOCKET,
    POLICY_ADVISOR_SOCKET,
} = process.env;

if (!PULSE_CONTRACT || !DAO_CONTRACT || !INFURA_URL) {
    console.error("❌ Missing required env vars. Please check .env.override");
    process.exit(1);
}

// 🪐 Polygon Provider — Ethers v6 Safe, ENS Disabled
let provider;
try {
    const { WebSocketProvider } = ethers;

    const polygonNetwork = {
        name: "matic",
        chainId: 137,
        ensAddress: null,
    };

    provider = new WebSocketProvider(INFURA_URL, polygonNetwork);

    // 🧩 Disable ENS resolution to prevent UNSUPPORTED_OPERATION
    provider.resolveName = async (name) => name;
    provider.getResolver = async () => null;

    console.log(chalk.green("✅ Polygon provider initialized successfully."));
} catch (err) {
    console.error("❌ Failed to initialize Polygon WebSocketProvider:", err);
    process.exit(1);
}

// 👁️ ABIs
const pulseABI = [
    "event ProposalCreated(uint256 indexed id, address proposer, string description)",
    "event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight)",
    "event ProposalExecuted(uint256 indexed id, address executor)",
    "event GovernanceParameterUpdated(string key, string value)",
];

const daoABI = [
    "function proposals(uint256) view returns (uint256 id, address proposer, string memory description, bool executed)",
    "function quorum() view returns (uint256)",
];

// 🔗 Contracts
const pulseContract = new ethers.Contract(PULSE_CONTRACT, pulseABI, provider);
const daoContract = new ethers.Contract(DAO_CONTRACT, daoABI, provider);

// 🔗 Socket Connections
const sentinelSocket = Client(SENTINEL_SOCKET, { reconnection: true });
const policySocket = Client(POLICY_ADVISOR_SOCKET, { reconnection: true });

console.log(chalk.cyan("🚀 PulseNFT Governance Listener active..."));
console.log(chalk.gray(`📡 Listening on ${INFURA_URL}`));

// 🧠 Unified Event Dispatch
function dispatch(eventName, data) {
    const payload = { event: eventName, data, timestamp: Date.now() };
    io.emit("governance:update", payload);
    sentinelSocket.emit("sentinel:governance:update", payload);
    policySocket.emit("policy:advisory:update", payload);
    console.log(chalk.yellow("📡 Event:"), chalk.green(eventName), JSON.stringify(data));
}

// 🧭 Event Subscriptions
pulseContract.on("ProposalCreated", async (id, proposer, description) => {
    try {
        const proposal = await daoContract.proposals(id);
        dispatch("ProposalCreated", { id: id.toString(), proposer, description, proposal });
    } catch (err) {
        console.error("⚠️ Failed to fetch proposal details:", err.message);
    }
});

pulseContract.on("VoteCast", (voter, proposalId, support, weight) => {
    dispatch("VoteCast", {
        voter,
        proposalId: proposalId.toString(),
        support,
        weight: weight.toString(),
    });
});

pulseContract.on("ProposalExecuted", (id, executor) => {
    dispatch("ProposalExecuted", { id: id.toString(), executor });
});

pulseContract.on("GovernanceParameterUpdated", (key, value) => {
    dispatch("GovernanceParameterUpdated", { key, value });
});

// 🛡️ Error + Reconnect Handling
if (provider && provider._websocket) {
    provider._websocket.on("close", () => {
        console.warn("⚠️ WebSocket closed. Attempting reconnection in 5s...");
        setTimeout(() => process.exit(1), 5000); // PM2 auto-restart
    });

    provider._websocket.on("error", (err) => {
        console.error("❌ WebSocket error:", err);
    });
}
