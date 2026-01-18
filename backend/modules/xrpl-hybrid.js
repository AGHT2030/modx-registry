
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

/**
 * © 2025 AG Holdings | CoinPurse™ XRPL Hybrid Connector (Final Fixed Version)
 * Works seamlessly with both CommonJS and ES Modules
 */

let xrpl;
let client;

async function initXRPL() {
    if (!xrpl) {
        try {
            xrpl = await import("xrpl");
            xrpl = xrpl.default || xrpl;
        } catch {
            xrpl = require("xrpl");
        }
    }

    const XRPL_NODE = process.env.XRPL_NODE_URL || "wss://xrplcluster.com";
    if (!client) client = new xrpl.Client(XRPL_NODE);

    if (!client.isConnected()) {
        await client.connect();
        console.log(`✅ XRPL Hybrid Connected: ${XRPL_NODE}`);
    }
    return client;
}

async function connectXRPL() {
    return await initXRPL();
}

async function createWallet(seed) {
    await initXRPL();
    const wallet = xrpl.Wallet.fromSeed(seed);
    console.log(`🔐 Wallet loaded: ${wallet.address}`);
    return wallet;
}

async function getBalance(address) {
    const conn = await initXRPL();
    const balance = await conn.getXrpBalance(address);
    console.log(`💰 ${address} → ${balance} XRP`);
    return { address, balance };
}

async function sendPayment(seed, destination, amount) {
    const conn = await initXRPL();
    const wallet = xrpl.Wallet.fromSeed(seed);
    const tx = {
        TransactionType: "Payment",
        Account: wallet.address,
        Amount: xrpl.xrpToDrops(amount),
        Destination: destination
    };
    const prepared = await conn.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await conn.submitAndWait(signed.tx_blob);
    console.log("📤 TX Result:", result.result.meta.TransactionResult);
    return result;
}

// Export for both environments (CommonJS, AMD, or global)
const exported = { connectXRPL, createWallet, getBalance, sendPayment };

if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
} else if (typeof define === "function" && define.amd) {
    define(() => exported);
} else if (typeof globalThis !== "undefined") {
    globalThis.xrplHybrid = exported;
}

// Auto-connect when executed directly (safe check for CommonJS)
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
    connectXRPL();
}
