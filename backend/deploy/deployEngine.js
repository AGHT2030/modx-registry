/**
 * © 2025 AIMAL | Direct Deployment Engine (DDE)
 * Deploys contracts WITHOUT Hardhat or plugins.
 * Works with any RPC endpoint.
 */

const { ethers } = require("ethers");
const RPC_LIST = require("./rpcConfig");

async function getProvider() {
    for (const rpc of RPC_LIST) {
        try {
            const provider = new ethers.JsonRpcProvider(rpc);
            await provider.getBlockNumber(); // test connection
            console.log("🔗 Using RPC:", rpc);
            return provider;
        } catch (err) {
            console.warn("⚠️ RPC failed:", rpc);
        }
    }
    throw new Error("❌ No RPC endpoint available.");
}

async function deployContract(bytecode, abi, signer, constructorArgs = []) {
    const provider = signer.provider;

    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    console.log("🚀 Deploying contract...");
    const contract = await factory.deploy(...constructorArgs);

    console.log("⏳ Waiting for confirmations...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Contract deployed at:", address);

    return address;
}

module.exports = {
    getProvider,
    deployContract
};
