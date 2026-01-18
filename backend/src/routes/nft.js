
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

// © 2025 AIMAL Global Holdings | MODA NFT Route
// Handles minting, metadata, and verification for MODA NFTs (ERC721/1155)

const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const logger = require("../../logger");

// Load configuration from environment
const RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const NFT_ABI_PATH = process.env.NFT_ABI_PATH || "./abis/MODANFT.json";

let nftAbi = [];
try {
    nftAbi = require("../../../" + NFT_ABI_PATH);
} catch (err) {
    logger.warn("⚠️ NFT ABI not found. NFT routes will run in mock mode.");
}

// Provider setup
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// 🔹 GET /api/nft/ping — basic check
router.get("/ping", (req, res) => {
    res.json({ status: "ok", message: "NFT route active" });
});

// 🔹 GET /api/nft/info — returns contract + network info
router.get("/info", async (req, res) => {
    try {
        const network = await provider.getNetwork();
        res.json({
            contract: NFT_CONTRACT_ADDRESS,
            chainId: network.chainId,
            name: network.name,
        });
    } catch (err) {
        logger.error("❌ Failed to fetch NFT info:", err);
        res.status(500).json({ error: "Failed to fetch NFT contract info" });
    }
});

// 🔹 POST /api/nft/mint — mint a new NFT
// body: { to: "0x...", tokenURI: "ipfs://..." }
router.post("/mint", async (req, res) => {
    try {
        const { to, tokenURI } = req.body;
        if (!to || !tokenURI)
            return res.status(400).json({ error: "Missing 'to' or 'tokenURI'" });

        // load wallet signer
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, wallet);

        const tx = await contract.safeMint(to, tokenURI);
        const receipt = await tx.wait();

        logger.info(`✅ NFT minted for ${to} — TxHash: ${receipt.transactionHash}`);
        res.json({ status: "ok", txHash: receipt.transactionHash, to, tokenURI });
    } catch (err) {
        logger.error("❌ NFT mint failed:", err);
        res.status(500).json({ error: "Minting failed", details: err.message });
    }
});

// 🔹 GET /api/nft/verify/:tokenId — verify NFT ownership
router.get("/verify/:tokenId", async (req, res) => {
    try {
        const tokenId = req.params.tokenId;
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, provider);
        const owner = await contract.ownerOf(tokenId);
        res.json({ tokenId, owner });
    } catch (err) {
        logger.error("❌ NFT verification failed:", err);
        res.status(404).json({ error: "Token not found or verification failed" });
    }
});

module.exports = router;
