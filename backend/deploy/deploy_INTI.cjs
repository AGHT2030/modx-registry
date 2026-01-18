/**
 * © 2025 AIMAL Global Holdings | MODX Sovereign Technologies
 * God-Mode Deployer — INTI Token (Polygon Mainnet)
 *
 * Deploys INTI ONLY if address = null in etfRegistry.json
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// ---------------------------------------------
// FIXED PATH: ETF Registry
// ---------------------------------------------
const registryPath = path.join(
    __dirname,
    "../../etf-suite/config/etfRegistry.json"
);

if (!fs.existsSync(registryPath)) {
    console.error("❌ ERROR: Missing etfRegistry.json at:", registryPath);
    process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

// ---------------------------------------------
// CONSTRUCTOR ARGUMENTS (STATIC)
// ---------------------------------------------
const TREASURY_SAFE = "0x9B2Fe096F2E6452dBeD91f3F729De80E0c7b6015";
const DAO_CONTROLLER = "0x197440Eab222f24a2C390f7eBb781A1Bf3d61F0c";
const ORACLE_ADDRESS = "0x4Cafd2804cBc379303EBAC5e752Cd4393A70Bc49";

const constructorArgs = [
    TREASURY_SAFE,
    DAO_CONTROLLER,
    ORACLE_ADDRESS
];

// ---------------------------------------------
// LOAD HARDHAT ARTIFACT FOR INTI
// ---------------------------------------------
function loadArtifact(contractName) {
    const artifactPath = path.join(
        __dirname,
        `../../artifacts/contracts/${contractName}.sol/${contractName}.json`
    );

    if (!fs.existsSync(artifactPath)) {
        console.error("❌ ERROR: Missing artifact:", artifactPath);
        process.exit(1);
    }

    return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

const INTI_ARTIFACT = loadArtifact("INTI");

// ---------------------------------------------
// PROVIDER + SIGNER (Polygon Mainnet)
// ---------------------------------------------
const RPC_URL = "https://polygon-rpc.com";

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;
if (!DEPLOYER_KEY || DEPLOYER_KEY.length < 64) {
    console.error("❌ ERROR: Missing or invalid DEPLOYER_PRIVATE_KEY in .env");
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(DEPLOYER_KEY, provider);

// ---------------------------------------------
// MAIN DEPLOY FUNCTION
// ---------------------------------------------
async function main() {
    console.log("🚀 Starting INTI Deployment (Polygon Mainnet)");

    console.log("👤 Deployer:", await wallet.getAddress());

    // Check registry first
    if (registry.core?.INTI?.address) {
        console.log("⏭️ INTI already deployed at:", registry.core.INTI.address);
        return;
    }

    console.log("📦 Preparing INTI deployment…");

    const factory = new ethers.ContractFactory(
        INTI_ARTIFACT.abi,
        INTI_ARTIFACT.bytecode,
        wallet
    );

    console.log("   ↳ Constructor Args:", constructorArgs);

    const contract = await factory.deploy(...constructorArgs);

    console.log("⏳ Waiting for confirmations…");
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log("🎉 INTI DEPLOYED at:", deployedAddress);

    // -----------------------------------------
    // UPDATE REGISTRY
    // -----------------------------------------
    registry.core = registry.core || {};
    registry.core.INTI = {
        address: deployedAddress,
        deployedAt: new Date().toISOString(),
        constructorArgs
    };

    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    console.log("📘 Registry updated:", registryPath);

    console.log("✅ INTI Deployment Complete");
}

// ---------------------------------------------
// EXECUTE
// ---------------------------------------------
main().catch((err) => {
    console.error("❌ Deployment Error:", err);
    process.exit(1);
});
