/**
 * © 2025 AG Holdings Trust | ETF Bridge Layer
 * -------------------------------------------------------------
 * Unified ETF Bridge:
 *   • Loads deployed ETF addresses from deployments/polygon/
 *   • Exposes resolve(), unit size & ETF type helpers
 *   • Provides getInstance() for ABI-bound contract access
 *   • Auto-attaches Mint/Burn event listeners to all ETFs
 *   • Broadcasts events to AURA Twins, PQC Engine, MODLINK DAO
 *   • Used by GalaxyRouter, MODLINK DAO, AURA Twins, PQC Engine
 */

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const ETFRegistry = require("./ETFRegistry.cjs");
const pqc = require("../security/pqc_shield.cjs");
const telemetry = require("./ETF_Telemetry.cjs");

// -------------------------------------------------------------
// 🔌 Provider (Polygon Mainnet for Production)
// -------------------------------------------------------------
const RPC = process.env.POLYGON_RPC;
const provider = new ethers.JsonRpcProvider(RPC);

// -------------------------------------------------------------
// 📦 INTERNAL — Load deployed ETF addresses from filesystem
// -------------------------------------------------------------
function loadAddress(name) {
    const file = path.join(__dirname, `../../deployments/polygon/${name}.json`);

    if (!fs.existsSync(file)) {
        console.warn(`⚠ ETF Deployment Not Found: ${name} → expected at: ${file}`);
        return null;
    }

    const { address } = JSON.parse(fs.readFileSync(file));
    return address;
}

// -------------------------------------------------------------
// 🧠 INTERNAL — Auto-initialize event listeners (with NAV breaker)
// -------------------------------------------------------------
const ETF_CircuitBreaker = require("./ETF_CircuitBreaker.cjs");

async function attachEventPipeline(name, contract) {
    if (!contract) return;

    console.log(`🔗 ETF Event Pipeline Bound → ${name}`);

    /**
     * ==========================================================
     * MINT EVENT
     * ==========================================================
     */
    contract.on("Mint", async (sender, amount, evt) => {
        try {
            // Get current NAV
            const newNav = await contract.getNAV();

            // Circuit Breaker Check
            if (ETF_CircuitBreaker.check(name, Number(newNav))) {
                console.warn(`⛔ NAV Breaker Halt during MINT for ${name}. Event suppressed.`);
                return; // stop processing downstream
            }

            // Normal event flow
            telemetry.recordMint(name, sender, amount);
            pqc.hashEvent("ETF_MINT", { name, sender, amount, nav: Number(newNav) });

            global.AURA?.broadcast("etf:mint", { name, sender, amount, nav: Number(newNav) });
            global.MODLINK?.emit("etf:mint", { name, sender, amount, nav: Number(newNav) });

            console.log(`🟢 [ETF MINT] ${name} → NAV: ${newNav} | ${sender} minted ${amount}`);
        } catch (err) {
            console.error(`❌ Error in Mint pipeline for ${name}:`, err);
        }
    });

    /**
     * ==========================================================
     * BURN EVENT
     * ==========================================================
     */
    contract.on("Burn", async (sender, amount, evt) => {
        try {
            // Get current NAV
            const newNav = await contract.getNAV();

            // Circuit Breaker Check
            if (ETF_CircuitBreaker.check(name, Number(newNav))) {
                console.warn(`⛔ NAV Breaker Halt during BURN for ${name}. Event suppressed.`);
                return; // stop processing downstream
            }

            // Normal event flow
            telemetry.recordBurn(name, sender, amount);
            pqc.hashEvent("ETF_BURN", { name, sender, amount, nav: Number(newNav) });

            global.AURA?.broadcast("etf:burn", { name, sender, amount, nav: Number(newNav) });
            global.MODLINK?.emit("etf:burn", { name, sender, amount, nav: Number(newNav) });

            console.log(`🔴 [ETF BURN] ${name} → NAV: ${newNav} | ${sender} burned ${amount}`);
        } catch (err) {
            console.error(`❌ Error in Burn pipeline for ${name}:`, err);
        }
    });
}

// -------------------------------------------------------------
// 📚 PUBLIC API — Updated with full Batch 3 functionality
// -------------------------------------------------------------
module.exports = {
    /**
     * Look up ETF configuration from ETFRegistry.cjs
     */
    resolve(etf) {
        return ETFRegistry[etf] || null;
    },

    getUnitSize(etf) {
        return ETFRegistry[etf]?.unitSize || 0;
    },

    isUpgradeable(etf) {
        return ETFRegistry[etf]?.type === "GOV_UPGRADEABLE";
    },

    isAdaptive(etf) {
        return ETFRegistry[etf]?.type === "ADAPTIVE";
    },

    /**
     * Return all deployed ETF addresses
     */
    getAddresses() {
        const names = Object.keys(ETFRegistry);
        const out = {};

        for (const name of names) {
            out[name] = loadAddress(name);
        }

        return out;
    },

    /**
     * Instantiate any ETF using its ABI + auto-bind event pipeline
     */
    async getInstance(name, abi) {
        const address = loadAddress(name);
        if (!address) throw new Error(`ETF not deployed: ${name}`);

        const contract = new ethers.Contract(address, abi, provider);

        // Auto-attach AURA/PQC/MODLINK pipelines
        attachEventPipeline(name, contract);

        return contract;
    },

    /**
     * Return a single deployed address
     */
    getAddress(name) {
        return loadAddress(name);
    },

    /**
     * Initialize ALL ETFs at boot
     * (Used by Router + MODLINK + Gateway)
     */
    async initializeAll(abiMap) {
        const names = Object.keys(ETFRegistry);

        for (const name of names) {
            try {
                const abi = abiMap[name];
                if (!abi) {
                    console.warn(`⚠ ABI missing for ETF: ${name}`);
                    continue;
                }

                const addr = loadAddress(name);
                if (!addr) continue;

                const instance = new ethers.Contract(addr, abi, provider);
                attachEventPipeline(name, instance);

                console.log(`🚀 ETF Initialized: ${name} @ ${addr}`);
            } catch (err) {
                console.error(`❌ ETF Init Failed (${name}):`, err);
            }
        }
    }
};
