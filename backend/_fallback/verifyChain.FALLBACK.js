
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

// © 2025 Mia Lopez | CoinPurse™ Chain Verifier Service
// Hybrid v5 + v6 compatible — uses shared provider factory from loadEthers.js
// Fully integrated with MODX Universe Gateway + AG Holdings Trust infrastructure.

const { getProvider, ethers } = require("../utils/loadEthers");

/**
 * 🔍 verifyChain — validates on-chain transaction status
 * Supports Polygon, Amoy, or any RPC-compatible network.
 * Automatically detects Ethers version via loadEthers.js
 */
exports.verifyChain = async ({ chain = "polygon", txHash }) => {
    const startTime = Date.now();

    try {
        const provider = getProvider();
        if (!provider) {
            throw new Error("Provider unavailable — check RPC_URL or network connection.");
        }

        if (!txHash || !/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
            throw new Error("Invalid transaction hash format.");
        }

        // 🔹 Fetch transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            console.warn(`⏳ Pending transaction detected on ${chain}: ${txHash}`);
            return {
                success: true,
                status: "pending",
                message: `Transaction ${txHash} not yet confirmed on ${chain}`,
                checkedAt: new Date().toISOString(),
                elapsedMs: Date.now() - startTime,
            };
        }

        // 🔹 Format and enrich response
        const success = receipt.status === 1;
        const result = {
            success,
            status: success ? "success" : "failed",
            txHash,
            blockNumber: receipt.blockNumber,
            from: receipt.from,
            to: receipt.to,
            gasUsed: receipt.gasUsed?.toString() || "N/A",
            chain,
            network: process.env.NETWORK_NAME || "Polygon Mainnet",
            timestamp: new Date().toISOString(),
            elapsedMs: Date.now() - startTime,
        };

        console.log(`🔎 verifyChain: ${chain} | Block ${receipt.blockNumber} | ${success ? "✅ SUCCESS" : "❌ FAILED"}`);
        return result;

    } catch (err) {
        console.error("💥 verifyChain error:", err.message);
        return {
            success: false,
            status: "error",
            error: err.message,
            chain,
            checkedAt: new Date().toISOString(),
            elapsedMs: Date.now() - startTime,
        };
    }
};
