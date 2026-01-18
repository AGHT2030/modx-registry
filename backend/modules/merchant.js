
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

// ✅ MODARetail Merchant Integration API Handler
// © 2025 Mia Lopez | MODX Ecosystem
// 📂 backend/modules/merchant.js

const express = require("express");
const router = express.Router();
const { getProvider, ethers } = require("../utils/loadEthers");
const MODARetailNFTABI = require("../../abis/MODARetailNFT.json"); // ABI must be exported after contract compilation

// 🔐 Replace with actual deployed NFT contract address
const MODARetailNFTAddress = "0xYourDeployedRetailNFTAddress";

// 🧩 Load environment and unified provider
const provider = getProvider();
if (!provider) {
    console.error("❌ Provider not initialized. Check RPC_URL or loadEthers.js configuration.");
}

// 🧩 Initialize signer (wallet)
let signer;
try {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("✅ Merchant signer initialized");
} catch (err) {
    console.error("💥 Failed to initialize merchant signer:", err.message);
}

// 🧩 Connect NFT contract
let retailContract;
try {
    retailContract = new ethers.Contract(MODARetailNFTAddress, MODARetailNFTABI, signer);
    console.log("✅ MODARetailNFT contract connected");
} catch (err) {
    console.error("💥 Failed to connect contract:", err.message);
}

// 🎯 POST /api/merchant/mint-sku
router.post("/mint-sku", async (req, res) => {
    try {
        const { to, tokenId, uri, quantity } = req.body;

        if (!retailContract) {
            throw new Error("Retail contract not initialized");
        }

        const tx = await retailContract.mint(to, tokenId, uri, quantity);
        await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("❌ Mint SKU failed:", err);
        res.status(500).json({ error: "Minting failed", detail: err.message });
    }
});

// 📦 POST /api/merchant/update-inventory
router.post("/update-inventory", async (req, res) => {
    try {
        const { tokenId, newURI } = req.body;

        if (!retailContract) {
            throw new Error("Retail contract not initialized");
        }

        const tx = await retailContract.setTokenURI(tokenId, newURI);
        await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("❌ Inventory update failed:", err);
        res.status(500).json({ error: "Update failed", detail: err.message });
    }
});

module.exports = router;
