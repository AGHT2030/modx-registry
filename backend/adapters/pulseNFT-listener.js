
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
// PulseNFT / MODLINK Governance Listener — feeds DAO events into Sentinel & Policy Advisor

const { ethers } = require("ethers");
const dotenv = require("dotenv");
const chalk = require("chalk");
const { io } = require("../aura/aura-spectrum.js");
const { io: Client } = require("socket.io-client");

dotenv.config({ path: process.env.ENV_PATH || ".env.override" });

const {
    PULSE_CONTRACT,
    DAO_CONTRACT,
    INFURA_PROJECT_ID,
    INFURA_URL,
    SENTINEL_SOCKET,
    POLICY_ADVISOR_SOCKET,
} = process.env;

if (!DAO_CONTRACT || !(INFURA_PROJECT_ID || INFURA_URL)) {
    console.error("❌ Missing required env vars. Please check .env.override");
    process.exit(1);
}

// 🪐 Infura Provider
const fullInfuraUrl = `wss://polygon-mainnet.infura.io/ws/v3/${INFURA_PROJECT_ID}`;
let provider;
try {
    const { WebSocketProvider } = ethers;
    provider = new WebSocketProvider(fullInfuraUrl, { name: "matic", chainId: 137, ensAddress: null });
    provider.resolveName = async (n) => n;
    provider.getResolver = async () => null;
    console.log(chalk.green("✅ Polygon provider initialized successfully."));
} catch (err) {
    console.error("❌ Polygon provider failed:", err);
    process.exit(1);
}

// 🧩 ABIs
const pulseABI = [
    "event ProposalCreated(uint256 indexed id, address proposer, string description)",
    "event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight)",
    "event ProposalExecuted(uint256 indexed id, address executor)",
    "event GovernanceParameterUpdated(string key, string value)",
];

const daoABI = [
    "event RouteExecuted(address indexed token, address indexed to, uint256 amount, bytes ctx)",
    "event GovernanceUpdated(address indexed admin, string policy, string value)",
    "function quorum() view returns (uint256)",
];

// 🧱 Contracts
const pulseContract = ethers.isAddress(PULSE_CONTRACT)
    ? new ethers.Contract(PULSE_CONTRACT, pulseABI, provider)
    : null;

const daoContract = new ethers.Contract(DAO_CONTRACT, daoABI, provider);

// 🔗 Sockets
const sentinelSocket = Client(SENTINEL_SOCKET, { reconnection: true });
const policySocket = Client(POLICY_ADVISOR_SOCKET, { reconnection: true });

console.log(chalk.cyan("🚀 MODLINK Governance Listener active..."));
console.log(chalk.gray(`📡 Listening on ${fullInfuraUrl}`));

// 🧠 Event Dispatch
function dispatch(eventName, data) {
    const payload = { event: eventName, data, timestamp: Date.now() };
    io.emit("governance:update", payload);
    sentinelSocket.emit("sentinel:governance:update", payload);
    policySocket.emit("policy:advisory:update", payload);
    console.log(chalk.yellow("📡 Event:"), chalk.green(eventName), JSON.stringify(data));
}

// 🧭 MODLINK Event Subscriptions
daoContract.on("RouteExecuted", (token, to, amount, ctx) => {
    dispatch("RouteExecuted", { token, to, amount: amount.toString(), ctx });
});

daoContract.on("GovernanceUpdated", (admin, policy, value) => {
    dispatch("GovernanceUpdated", { admin, policy, value });
});

// 🧭 Optional PulseNFT Listener (placeholder until deploy)
if (pulseContract) {
    pulseContract.on("ProposalCreated", (id, proposer, description) => {
        dispatch("ProposalCreated", { id: id.toString(), proposer, description });
    });
}

// 🛡️ WebSocket Error Handling
if (provider._websocket) {
    provider._websocket.on("close", () => {
        console.warn("⚠️ WebSocket closed — restarting in 5s...");
        setTimeout(() => process.exit(1), 5000);
    });
    provider._websocket.on("error", (err) => {
        console.error("❌ WebSocket error:", err);
    });
}
