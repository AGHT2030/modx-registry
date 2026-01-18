
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

// © 2025 AIMAL Global Holdings | MODX Governance Test Suite
// PulseNFT Governance Listener Verification Module
// Confirms event propagation → Sentinel + Policy Advisor sockets

const { io } = require("socket.io-client");
const chalk = require("chalk");
require("dotenv").config({ path: ".env.override" });

// 🧩 Environment variables
const SENTINEL_SOCKET = process.env.SENTINEL_SOCKET || "http://localhost:8085";
const POLICY_ADVISOR_SOCKET = process.env.POLICY_ADVISOR_SOCKET || "http://localhost:8086";
const LOCAL_AURA_SOCKET = "http://localhost:8088";

// 🛰️ Test sockets
const sentinel = io(SENTINEL_SOCKET);
const policy = io(POLICY_ADVISOR_SOCKET);
const aura = io(LOCAL_AURA_SOCKET);

// 🧭 Event registry
let received = {
    sentinel: false,
    policy: false,
    aura: false,
};

// 🧠 Mock governance event
const mockEvent = {
    event: "ProposalCreated",
    data: {
        id: "9999",
        proposer: "0xBLCF000000000000000000000000000000000000",
        description: "Test Governance Proposal — Listener Verification",
    },
    timestamp: Date.now(),
};

// 🧪 Emit from AURA Spectrum Stub
console.log(chalk.cyan("🔍 Starting PulseNFT Listener verification test..."));
setTimeout(() => {
    console.log(chalk.yellow("📡 Emitting mock governance event from AURA Stub..."));
    aura.emit("governance:update", mockEvent);
}, 1500);

// ✅ Listen for reception
sentinel.on("sentinel:governance:update", (payload) => {
    console.log(chalk.green("✅ Sentinel received:"), payload.event);
    received.sentinel = true;
});

policy.on("policy:advisory:update", (payload) => {
    console.log(chalk.green("✅ Policy Advisor received:"), payload.event);
    received.policy = true;
});

aura.on("governance:update", (payload) => {
    console.log(chalk.green("✅ AURA received loopback:"), payload.event);
    received.aura = true;
});

// 🧾 Verification report
setTimeout(() => {
    console.log(chalk.gray("\n───────────────────────────────"));
    console.log(chalk.bold("🧩 PulseNFT Governance Listener Verification Report"));
    console.log(chalk.gray("───────────────────────────────"));
    console.log(`AURA Spectrum:        ${received.aura ? "✅" : "❌"}`);
    console.log(`Sentinel Socket:      ${received.sentinel ? "✅" : "❌"}`);
    console.log(`Policy Advisor:       ${received.policy ? "✅" : "❌"}`);

    if (received.aura && received.sentinel && received.policy) {
        console.log(chalk.greenBright("\n🎯 All sockets successfully received governance event!"));
    } else {
        console.log(chalk.redBright("\n⚠️  One or more sockets did not respond — check PM2 logs or port bindings."));
    }
    process.exit(0);
}, 8000);
