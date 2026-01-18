
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
 * © 2025 AG Holdings | CoinPurse™ XRPL Hybrid Connector (Fixed Version)
 * Compatible with both CommonJS (.js/.cjs) and ES Modules (.mjs)
 */

(async () => {
    let xrpl;
    try {
        // Try dynamic ESM import first
        xrpl = await import("xrpl");
        xrpl = xrpl.default || xrpl;
    } catch (e) {
        // Fallback to CommonJS require
        xrpl = require("xrpl");
    }

    const XRPL_NODE = process.env.XRPL_NODE_URL || "wss://xrplcluster.com";
    const client = new xrpl.Client(XRPL_NODE);

    async function connectXRPL() {
        if (!client.isConnected()) {
            await client.connect();
            console.log(`✅ XRPL Hybrid Connected: ${XRPL_NODE}`);
        }
        return client;
    }

    async function createWallet(seed) {
        const wallet = xrpl.Wallet.fromSeed(seed);
        console.log(`🔐 Wallet loaded: ${wallet.address}`);
        return wallet;
    }

    async function getBalance(address) {
        const conn = await connectXRPL();
        const balance = await conn.getXrpBalance(address);
        console.log(`💰 ${address} → ${balance} XRP`);
        return { address, balance };
    }

    async function sendPayment(seed, destination, amount) {
        const conn = await connectXRPL();
        const wallet = xrpl.Wallet.fromSeed(seed);

        const tx = {
            TransactionType: "Payment",
            Account: wallet.address,
            Amount: xrpl.xrpToDrops(amount),
            Destination: destination,
        };

        const prepared = await conn.autofill(tx);
        const signed = wallet.sign(prepared);
        const result = await conn.submitAndWait(signed.tx_blob);
        console.log("📤 TX Result:", result.result.meta.TransactionResult);
        return result;
    }

    // Expose functions globally for direct calls
    global.connectXRPL = connectXRPL;
    global.createWallet = createWallet;
    global.getBalance = getBalance;
    global.sendPayment = sendPayment;

    // Auto-connect when run directly
    if (require.main === module) {
        await connectXRPL();
    }

    // CommonJS export
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { connectXRPL, createWallet, getBalance, sendPayment };
    }
})();
