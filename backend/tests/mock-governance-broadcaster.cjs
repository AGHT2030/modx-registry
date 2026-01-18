
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
// Mock Governance Event Broadcaster — simulates MODLINK activity for local testing

const chalk = require("chalk");
const { io } = require("socket.io-client");
require("dotenv").config({ path: process.env.ENV_PATH || ".env.override" });

const {
    SENTINEL_SOCKET = "http://localhost:8085",
    POLICY_ADVISOR_SOCKET = "http://localhost:8086",
} = process.env;

// 🔗 Connect to Sentinel + Policy Advisor
const sentinel = io(SENTINEL_SOCKET);
const policy = io(POLICY_ADVISOR_SOCKET);

sentinel.on("connect", () => console.log(chalk.green(`✅ Connected to Sentinel on ${SENTINEL_SOCKET}`)));
policy.on("connect", () => console.log(chalk.green(`✅ Connected to Policy Advisor on ${POLICY_ADVISOR_SOCKET}`)));

console.log(chalk.cyan("🧪 Starting mock governance event broadcast..."));

// 🧠 Mock event data
const mockAdmins = ["0xA1b2c3d4E5f6a7b8C9d0e1f2a3b4c5d6E7f8a9b0", "0x1111222233334444555566667777888899990000"];
const mockPolicies = ["TreasuryCap", "EmissionRate", "RewardPool", "LiquidityLock"];
const mockTokens = ["0xMODAPlayToken", "0xMODAStayToken", "0xMODABuildToken"];
let counter = 0;

// 🔄 Periodic broadcast
setInterval(() => {
    const eventType = counter % 2 === 0 ? "GovernanceUpdated" : "RouteExecuted";
    const payload =
        eventType === "GovernanceUpdated"
            ? {
                event: "GovernanceUpdated",
                data: {
                    admin: mockAdmins[Math.floor(Math.random() * mockAdmins.length)],
                    policy: mockPolicies[Math.floor(Math.random() * mockPolicies.length)],
                    value: Math.floor(Math.random() * 1000000).toString(),
                },
                timestamp: Date.now(),
            }
            : {
                event: "RouteExecuted",
                data: {
                    token: mockTokens[Math.floor(Math.random() * mockTokens.length)],
                    to: mockAdmins[Math.floor(Math.random() * mockAdmins.length)],
                    amount: (Math.random() * 1000).toFixed(2),
                    ctx: "0xMockContextData",
                },
                timestamp: Date.now(),
            };

    console.log(chalk.yellow(`📤 Broadcasting mock ${eventType}`), JSON.stringify(payload, null, 2));

    sentinel.emit("sentinel:governance:update", payload);
    policy.emit("policy:advisory:update", payload);

    counter++;
}, 5000); // every 5 seconds
