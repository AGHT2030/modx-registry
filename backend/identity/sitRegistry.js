/**
 * © 2025 AG Holdings Trust | Sovereign Identity Token (SIT)
 * CoinPurse Identity Integration Layer
 *
 * Binds SIT → CoinPurse → AURA → AIRS → XRPL Identity Bridge
 */

const { ethers } = require("ethers");
const safeRequire = require("../middleware/globalSafeRequire");


// 🔐 Load SIT Contract ABI + Address
const SIT_ABI = safeRequire("./abi/SIT.json");
const SIT_ADDRESS = process.env.SIT_CONTRACT_ADDRESS;

// 🔗 Global Provider
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);

// 🌐 Global Registry (shared across CoinPurse services)
global.IdentityRegistry = global.IdentityRegistry || {};

// ------------------------------------------------------
// 📌 INIT: Load SIT + Sync to Global Registry
// ------------------------------------------------------
async function loadSITRegistry() {
    try {
        if (!SIT_ADDRESS) {
            console.warn("⚠ SIT address not defined in environment");
            return;
        }

        const contract = new ethers.Contract(SIT_ADDRESS, SIT_ABI, provider);

        global.IdentityRegistry.SIT = {
            contract,
            address: SIT_ADDRESS,
            async getIdentity(owner) {
                return await contract.identityOf(owner);
            },
            async resolveTokenId(id) {
                return await contract.identityMetadata(id);
            }
        };

        console.log("🔗 SIT Registry Loaded → CoinPurse Identity Layer Active");
    } catch (err) {
        console.error("❌ SIT Registry Load Error:", err.message);
    }
}

loadSITRegistry();

module.exports = global.IdentityRegistry;
