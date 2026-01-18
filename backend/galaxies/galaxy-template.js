
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

// © 2025 AIMAL Global Holdings | MODX Galaxy Microservice Template (v2)
import express from "express";
import { io as Client } from "socket.io-client";
import chalk from "chalk";
import axios from "axios";
import fs from "fs";

const app = express();
app.use(express.json());

// 🧭 Environment setup
const GALAXY_NAME = process.env.GALAXY_NAME || "unknown";
const PORT = process.env.PORT || 7000;
const UNIVERSE_GATEWAY = process.env.UNIVERSE_GATEWAY || "http://localhost:5051";
const MODLINK_URL = process.env.MODLINK_URL || "http://localhost:9090";
const GOVERNANCE_TOKEN = process.env.MODLINK_GOVERNANCE_TOKEN || "unauthorized";

// 🛰️ Connect to Universe Gateway
const socket = Client(UNIVERSE_GATEWAY, { reconnection: true });
socket.on("connect", () => {
    console.log(chalk.greenBright(`🪐 ${GALAXY_NAME.toUpperCase()} connected to Universe Gateway`));

    socket.emit("galaxy:ready", {
        galaxy: GALAXY_NAME,
        governance: "MODLINK",
        timestamp: new Date().toISOString()
    });

    // 🔗 Register with MODLINK DAO governance
    registerWithModlink();
});

// 🔐 Governance registration to MODLINK
async function registerWithModlink() {
    try {
        const res = await axios.post(`${MODLINK_URL}/api/governance/register`, {
            galaxy: GALAXY_NAME,
            token: GOVERNANCE_TOKEN,
            status: "active",
            timestamp: new Date().toISOString()
        });
        console.log(chalk.cyan(`✅ ${GALAXY_NAME.toUpperCase()} registered with MODLINK DAO: ${res.status}`));
    } catch (err) {
        console.error(chalk.red(`⚠️ ${GALAXY_NAME.toUpperCase()} MODLINK registration failed: ${err.message}`));
    }
}

// 🔍 Health Check Endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        service: GALAXY_NAME,
        governance: "MODLINK",
        status: "online",
        timestamp: new Date().toISOString()
    });
});

// 🚀 Start Galaxy
app.listen(PORT, () => {
    console.log(chalk.cyanBright(`🌌 ${GALAXY_NAME.toUpperCase()} galaxy online on port ${PORT}`));
});

process.on("SIGINT", () => {
    console.log(chalk.yellow(`🪐 ${GALAXY_NAME} disconnecting gracefully...`));
    socket.disconnect();
    process.exit(0);
});
