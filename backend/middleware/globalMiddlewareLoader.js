
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

// © 2025 Mia Lopez | MODX Global Middleware Loader v5
// 🌍 Unified Chain Auto-Sync for MODX, AIRS, CoinPurse, MODUSDp, MODUSDs.
// Ensures: no undefined contract errors, no Express middleware failures,
// and full compatibility with Ethers v5 + Ethers v6 hybrid wrapper.

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");

// ========================================================================
// 1) ENVIRONMENT LOAD (override > dev > system)
// ========================================================================
const overridePath = path.resolve(__dirname, "../../.env.override");
const devPath = path.resolve(__dirname, "../../.env.dev");

if (fs.existsSync(overridePath)) {
    dotenv.config({ path: overridePath });
    console.log(`✅ Environment loaded from override: ${overridePath}`);
} else if (fs.existsSync(devPath)) {
    dotenv.config({ path: devPath });
    console.log(`✅ Environment loaded from dev: ${devPath}`);
} else {
    console.warn("⚠️ No .env file found — using system variables only.");
}

// ========================================================================
// 2) UNIVERSAL ADDRESS VALIDATOR (Ethers v5 + v6 safe)
// ========================================================================
function validateAddress(addr) {
    if (!addr) return false;

    // v6
    if (typeof ethers.isAddress === "function") {
        return ethers.isAddress(addr);
    }

    // v5
    if (ethers.utils && typeof ethers.utils.isAddress === "function") {
        return ethers.utils.isAddress(addr);
    }

    return false;
}

// ========================================================================
// 3) NETWORK AUTODETECT + RPC SYNC
// ========================================================================
function detectAndSyncNetwork() {
    const addr = (process.env.AIRS_CONTRACT_ADDRESS || "").toLowerCase();
    const hint =
        (process.env.AIRS_PROVIDER_URL ||
            process.env.MODX_PROVIDER_URL ||
            process.env.COINPURSE_PROVIDER_URL ||
            "").toLowerCase();

    let rpc = "https://rpc.ankr.com/eth";
    let network = "ethereum-mainnet";

    if (hint.includes("polygon") || addr.startsWith("0x")) {
        rpc = "https://polygon-rpc.com";
        network = "polygon-mainnet";
    } else if (hint.includes("base")) {
        rpc = "https://mainnet.base.org";
        network = "base-mainnet";
    }

    // Sync for all modules
    process.env.AIRS_PROVIDER_URL = rpc;
    process.env.MODX_PROVIDER_URL = rpc;
    process.env.COINPURSE_PROVIDER_URL = rpc;
    process.env.MODUSDp_PROVIDER_URL = rpc;
    process.env.MODUSDs_PROVIDER_URL = rpc;
    process.env.AIRS_NETWORK = network;

    console.log(
        `🔗 Network autodetected: ${network}\n   ↳ Synced AIRS, MODX, CoinPurse, MODUSDp, MODUSDs → ${rpc}`
    );

    if (!validateAddress(process.env.AIRS_CONTRACT_ADDRESS)) {
        console.warn("⚠️ Invalid AIRS_CONTRACT_ADDRESS (or missing).");
    }
}

detectAndSyncNetwork();

// ========================================================================
// 4) SAFE REQUIRE (v5) — Bulletproof middleware loader
// ========================================================================
function safeRequire(relPath) {
    try {
        const fullPath = path.resolve(__dirname, relPath);
        console.log("🧩 DEBUG SAFE REQUIRE PATH:", fullPath);

        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Middleware not found: ${relPath} — using fallback.`);
            return (req, res, next) => next();
        }

        const mod = require(fullPath);

        // If a single exported function
        if (typeof mod === "function") return mod;

        // If default function
        if (mod?.default && typeof mod.default === "function") return mod.default;

        // If router export
        if (mod?.router && typeof mod.router === "function") return mod.router;

        // If object of methods — grab first callable
        if (mod && typeof mod === "object") {
            const f = Object.values(mod).find((v) => typeof v === "function");
            if (f) return f;
        }

        console.warn(`⚠️ ${relPath} loaded as fallback middleware`);
        return (req, res, next) => next();
    } catch (err) {
        console.error(`❌ safeRequire failed for ${relPath}:`, err.message);
        return (req, res, next) => next();
    }
}

// ========================================================================
// EXPORTS
// ========================================================================
module.exports = {
    safeRequire,
    validateAddress,
};
