/**
 * © 2025 AIMAL | ETF Deployment Orchestrator
 * Unified deployer for INTI, wINTI, and BasketOracle
 * Loads real Hardhat artifacts instead of ../abi/
 */

// -------------------------------------------------------------
// 🌐 Load environment variables (dotenv must load before anything)
// -------------------------------------------------------------
require("dotenv").config();

// Debug: Confirm script start
console.log("🚀 ETF DEPLOY SCRIPT STARTED");

// Debug: Confirm key length (should be 64 if correct)
if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("⚠️ DEPLOYER_PRIVATE_KEY is NOT LOADED from .env");
} else {
    console.log("🔑 DEPLOYER_PRIVATE_KEY length:", process.env.DEPLOYER_PRIVATE_KEY.length);
}

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const { getProvider, deployContract } = require("./deployEngine");

// -------------------------------------------------------------
// 🧩 Load ABI + Bytecode directly from Hardhat artifacts
// -------------------------------------------------------------
function loadArtifact(contractName, fileName = null) {
    const artifactPath = path.join(
        __dirname,
        "../../artifacts/contracts/" +
        contractName +
        ".sol/" +
        (fileName || contractName) +
        ".json"
    );

    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Missing artifact:", artifactPath);
        process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    return {
        abi: artifact.abi,
        bytecode: artifact.bytecode
    };
}

// Load all artifacts
const INTI = loadArtifact("INTI");
const WINTI = loadArtifact("wINTI");
const ORACLE = loadArtifact("BasketOracle");

// -------------------------------------------------------------
// 🚀 DEPLOY ETF BATCH
// -------------------------------------------------------------
async function deployETFBatch(privateKey) {
    console.log("\n🔧 Initializing provider + signer...");

    const provider = await getProvider();
    const signer = new ethers.Wallet("0x" + privateKey, provider); // Add 0x prefix automatically

    const deployerAddress = await signer.getAddress();
    console.log("👤 Deployer Address:", deployerAddress);

    // ------------------------------
    // Deploy INTI
    // ------------------------------
    console.log("\n--- Deploying INTI ---");
    const intiAddress = await deployContract(
        INTI.bytecode,
        INTI.abi,
        signer,
        [] // no constructor args
    );
    console.log("🌕 INTI deployed at:", intiAddress);

    // ------------------------------
    // Deploy wINTI
    // ------------------------------
    console.log("\n--- Deploying wINTI ---");
    const wintiAddress = await deployContract(
        WINTI.bytecode,
        WINTI.abi,
        signer,
        []
    );
    console.log("🌗 wINTI deployed at:", wintiAddress);

    // ------------------------------
    // Deploy Oracle
    // ------------------------------
    console.log("\n--- Deploying BasketOracle ---");
    const oracleAddress = await deployContract(
        ORACLE.bytecode,
        ORACLE.abi,
        signer,
        [intiAddress, wintiAddress] // constructor args
    );
    console.log("🔮 BasketOracle deployed at:", oracleAddress);

    console.log("\n🎉 ETF Batch Deployment Complete");
}

// -------------------------------------------------------------
// AUTO-RUN MODE WHEN EXECUTED DIRECTLY
// -------------------------------------------------------------
if (require.main === module) {
    console.log("\n⚙️ Auto-run mode triggered...");

    const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;

    if (!DEPLOYER_KEY || DEPLOYER_KEY.trim() === "") {
        console.error("❌ ERROR: DEPLOYER_PRIVATE_KEY is missing or empty in .env");
        console.error("👉 Make sure .env contains: DEPLOYER_PRIVATE_KEY=yourkeyhere");
        process.exit(1);
    }

    console.log("🔑 Key loaded — starting deployETFBatch...\n");

    deployETFBatch(DEPLOYER_KEY)
        .then(() => console.log("\n🎉 Batch Completed Successfully"))
        .catch(err => {
            console.error("\n❌ Deployment Error:", err);
            process.exit(1);
        });
}

// Export for programmatic use if needed
module.exports = {
    deployETFBatch
};
