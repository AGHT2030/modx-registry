// © 2025 AIMAL Global Holdings | ETF → AURA Twin Adapter
// Bridges ETF on-chain events to AURA Twins, PQC Engine, Telemetry & MODLINK.

const ETFBridge = require("./ETF_Bridge.cjs");
const telemetry = require("../telemetry/etfTelemetry.cjs");
const pqc = require("../security/pqc_shield.cjs");

const { ethers } = require("ethers");
const { io } = require("../aura/aura-spectrum.js");

// Provider for all ETF listeners (Polygon Mainnet)
const RPC = process.env.POLYGON_RPC;
const provider = new ethers.JsonRpcProvider(RPC);
const AURA_NavSync = require("../aura/AURA_NavSync.cjs");

// ❗ No AURA_NavSync.update() here! ❗

module.exports = {
    // …
};

/**
 * Initialize all ETF listeners using ABI map:
 * {
 *   PLAYETF: [...ABI],
 *   SHOPETF: [...ABI],
 *   MODUSDxETF: [...ABI],
 *   MODUSDsETF: [...ABI],
 *   MODXINVSTETF: [...ABI]
 * }
 */
initETFListeners(abiMap); {
    const etfAddresses = ETFBridge.getAddresses();

    for (let [name, address] of Object.entries(etfAddresses)) {
        if (!address) {
            console.warn(`⚠ Skipping ETF: ${name} (no deployed address found)`);
            continue;
        }

        const abi = abiMap[name];
        if (!abi) {
            console.warn(`⚠ Missing ABI for ETF: ${name}`);
            continue;
        }

        const contract = new ethers.Contract(address, abi, provider);

        // -------------------------------
        // MINT Listener
        // -------------------------------
        contract.on("Mint", (account, amount, event) => {
            const tx = event?.log?.transactionHash;

            if (ETF_CircuitBreaker.check("MODUSDx", newNav)) {
                return; // halted
            }
            // AURA broadcast
            io.emit("etf:mint", { etf: name, account, amount, tx });

            // Twins update
            global.AURA?.twins?.update("etfActivity", {
                action: "mint",
                etf: name,
                account,
                amount,
                tx
            });

            // Telemetry
            telemetry.recordMint(name, account, amount);

            // PQC Hash
            pqc.hashEvent("ETF_MINT", { name, account, amount });

            // MODLINK governance stream
            global.MODLINK?.emit("etf:mint", { name, account, amount, tx });

            console.log(`🟢 [AURA ETF MINT] ${name} → ${account} minted ${amount}`);
        });

        // -------------------------------
        // BURN Listener
        // -------------------------------
        contract.on("Burn", (account, amount, event) => {
            const tx = event?.log?.transactionHash;

            if (ETF_CircuitBreaker.check("MODUSDx", newNav)) {
                return; // halted
            }

            // AURA broadcast
            io.emit("etf:burn", { etf: name, account, amount, tx });

            // Twins update
            global.AURA?.twins?.update("etfActivity", {
                action: "burn",
                etf: name,
                account,
                amount,
                tx
            });

            // Telemetry
            telemetry.recordBurn(name, account, amount);

            // PQC Hash
            pqc.hashEvent("ETF_BURN", { name, account, amount });

            // MODLINK governance stream
            global.MODLINK?.emit("etf:burn", { name, account, amount, tx });

            console.log(`🔴 [AURA ETF BURN] ${name} → ${account} burned ${amount}`);
        });

        console.log(`🫧 AURA Twin Adapter listening → ${name} ETF @ ${address}`);
    }

    console.log("✨ AURA ETF Twin Adapter fully initialized for all deployed ETFs.");
}

