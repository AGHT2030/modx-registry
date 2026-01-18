
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

// © 2025 Mia Lopez | CoinPurse™ Core Module (Full Initialization)
// -----------------------------------------------------------------------------
// Purpose:
//   Initialize CoinPurse smart wallet, sync MODLINK DAO, and report health.
//   Works in full RPC mode (Polygon / XRPL bridge) or stub fallback.
// -----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();


// -----------------------------------------------------------------------------
// 🧩 Environment
// -----------------------------------------------------------------------------
const RPC_URL = process.env.COINPURSE_RPC || "https://polygon-rpc.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);

let initialized = false;
let COINPURSE_ABI = [];
let contractInstances = {};
const tokenList = ["MODUSDp", "MODUSDs", "MODUSD-SEC", "MODXINVST", "MODXSTY"];

// -----------------------------------------------------------------------------
// 🧠 Load ABI
// -----------------------------------------------------------------------------
function loadABI() {
    try {
        const abiPath = path.resolve("backend/abis/CoinPurse.json");
        if (fs.existsSync(abiPath)) {
            COINPURSE_ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
            console.log(chalk.green(`✅ CoinPurse ABI loaded: ${abiPath}`));
            return true;
        } else {
            console.warn(chalk.yellow(`⚠️ CoinPurse ABI not found — fallback active.`));
            return false;
        }
    } catch (err) {
        console.warn(chalk.red(`⚠️ Failed to load CoinPurse ABI: ${err.message}`));
        return false;
    }
}

// -----------------------------------------------------------------------------
// 🔗 Connect Contracts
// -----------------------------------------------------------------------------
async function initContracts() {
    try {
        for (const token of tokenList) {
            const address = process.env[`${token}_ADDRESS`];
            if (!address || !ethers.isAddress(address)) {
                console.warn(`⚠️ Skipping invalid address for ${token}`);
                continue;
            }

            contractInstances[token] = new ethers.Contract(address, COINPURSE_ABI, provider);
            console.log(chalk.cyan(`🔗 ${token} connected at ${address}`));
        }
        return true;
    } catch (err) {
        console.error(chalk.red(`❌ Contract initialization failed: ${err.message}`));
        return false;
    }
}

// -----------------------------------------------------------------------------
// 🧭 Health Reporter
// -----------------------------------------------------------------------------
function startHealthReporter(interval = 60_000) {
    setInterval(async () => {
        try {
            const network = await provider.getNetwork();
            const status = {
                module: "CoinPurse Core",
                status: "online",
                chain: network.name,
                tokens: Object.keys(contractInstances),
                timestamp: new Date().toISOString(),
            };

            if (global.io) global.io.emit("coinpurse:health:update", status);
            if (global.AURA_OUTLIER) global.AURA_OUTLIER.lastPulse = status;

            console.log(chalk.gray(`💠 [CoinPurse] Health tick — ${status.tokens.length} tokens active`));
        } catch (err) {
            console.warn(chalk.yellow(`⚠️ CoinPurse health check degraded: ${err.message}`));
        }
    }, interval);
}

// -----------------------------------------------------------------------------
// 🧱 Full Initialization
// -----------------------------------------------------------------------------
async function initCoinPurse() {
    if (initialized) return;
    initialized = true;

    console.log(chalk.blueBright("💠 Initializing CoinPurse Core Module..."));

    const abiOk = loadABI();
    const contractsOk = abiOk ? await initContracts() : false;

    // Register in MODLINK DAO
    global.MODLINK = global.MODLINK || {};
    global.MODLINK.dao = global.MODLINK.dao || {};
    global.MODLINK.dao.coinpurse = {
        ready: true,
        contracts: Object.keys(contractInstances),
        rpc: RPC_URL,
    };

    if (abiOk && contractsOk) {
        console.log(chalk.greenBright("💠 CoinPurse fully initialized in RPC mode."));
    } else {
        console.warn(chalk.yellow("💠 CoinPurse running in fallback (stub) mode."));
    }

    startHealthReporter();
    global.COINPURSE = { initialized, contracts: contractInstances };
}
