
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

// © 2025 Mia Lopez | MODX Stack | Universal Ethers Loader (v5 + v6 Safe)
// Supports hybrid modules across CoinPurse, AIRS, and Universe Gateway

require("dotenv").config();

let ethersLib;
let providerFactory;

// ---------------------------------------------------------------------------
// 🧩 Load and detect Ethers version dynamically
// ---------------------------------------------------------------------------
try {
    ethersLib = require("ethers");
    const version =
        ethersLib.version || ethersLib.ethers?.version || "unknown";
    console.log(`🧩 Detected Ethers version: ${version}`);

    if (ethersLib.JsonRpcProvider) {
        // 🔹 v6 style (flat namespace)
        providerFactory = () =>
            new ethersLib.JsonRpcProvider(
                process.env.RPC_URL || "https://polygon-rpc.com"
            );
        console.log("🧠 Ethers v6 mode: JsonRpcProvider active");

    } else if (ethersLib.providers?.JsonRpcProvider) {
        // 🔹 v5 style (nested providers.*)
        providerFactory = () =>
            new ethersLib.providers.JsonRpcProvider(
                process.env.RPC_URL || "https://polygon-rpc.com"
            );
        console.log("🧠 Ethers v5 mode: providers.JsonRpcProvider active");

    } else {
        throw new Error("Unsupported Ethers structure — no JsonRpcProvider found");
    }

} catch (err) {
    console.error("❌ Failed to initialize ethers:", err.message);
    ethersLib = null;
    providerFactory = () => null;
}

// ---------------------------------------------------------------------------
// 🚀 Provider creation with network detection fallback
// ---------------------------------------------------------------------------
function getProvider() {
    if (!providerFactory) {
        console.warn("⚠️ No provider factory available — returning null");
        return null;
    }

    const provider = providerFactory();

    if (provider && typeof provider.detectNetwork === "function") {
        provider
            .detectNetwork()
            .then((net) =>
                console.log(`🌐 Connected network: ${net?.name || "unknown"} (${net?.chainId})`)
            )
            .catch((e) =>
                console.warn("⚠️ Network detection failed:", e.message)
            );
    } else {
        console.warn("⚠️ detectNetwork not supported — continuing without network check");
    }

    return provider;
}

// ---------------------------------------------------------------------------
// 🪙 Additional helpers for signer + version consistency
// ---------------------------------------------------------------------------
function getSigner(privateKey) {
    const provider = getProvider();
    if (!ethersLib || !provider)
        throw new Error("Ethers or provider not available");
    if (!privateKey)
        throw new Error("Missing private key for signer initialization");
    return new ethersLib.Wallet(privateKey, provider);
}

function getEthersVersion() {
    return ethersLib?.version || ethersLib?.ethers?.version || "unknown";
}

// ---------------------------------------------------------------------------
// ✅ CommonJS Exports
// ---------------------------------------------------------------------------
module.exports = {
    ethers: ethersLib,
    getProvider,
    getSigner,
    getEthersVersion,
};
