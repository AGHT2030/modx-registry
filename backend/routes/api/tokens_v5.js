
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

// © 2025 Mia Lopez | CoinPurse™ Backend API
// Token Manager & Oracle Interface (Ethers v6 Compatible)

const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env.dev") });

const { JsonRpcProvider, Contract, Wallet, parseUnits, formatUnits } = require("ethers");
const fs = require("fs");

// 🔹 ENV CONFIG
const RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "";
const TOKEN_ABI_PATH = path.join(__dirname, "../../abi/ERC20.json");
const TOKEN_ABI = fs.existsSync(TOKEN_ABI_PATH)
    ? require(TOKEN_ABI_PATH)
    : [
        // fallback minimal ABI
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address,uint256) returns (bool)",
        "function mint(address,uint256)",
        "function burn(address,uint256)"
    ];

// 🔹 PROVIDER + SIGNER
let provider;
try {
    provider = new JsonRpcProvider(RPC_URL);
    console.log("🧩 Ethers v6 JsonRpcProvider active");
} catch (err) {
    console.error("💥 Provider init failed:", err.message);
    provider = null;
}

const signer = PRIVATE_KEY && provider ? new Wallet(PRIVATE_KEY, provider) : null;

// 🔹 INIT TOKEN CONTRACT (lazy load)
function getTokenContract(write = false) {
    if (!provider) throw new Error("Provider not initialized");
    if (!TOKEN_ADDRESS) throw new Error("TOKEN_ADDRESS not set in .env");
    const conn = write && signer ? signer : provider;
    return new Contract(TOKEN_ADDRESS, TOKEN_ABI, conn);
}

// ===========================================================
//  ROUTES
// ===========================================================

// 📊 Get basic token info
router.get("/info", async (req, res) => {
    try {
        const token = getTokenContract();
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            token.name(),
            token.symbol(),
            token.decimals(),
            token.totalSupply()
        ]);
        res.json({
            name,
            symbol,
            decimals,
            totalSupply: formatUnits(totalSupply, decimals)
        });
    } catch (err) {
        console.error("❌ /info error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 💰 Get balance of address
router.get("/balance/:address", async (req, res) => {
    try {
        const address = req.params.address;
        const token = getTokenContract();
        const decimals = await token.decimals();
        const balance = await token.balanceOf(address);
        res.json({
            address,
            balance: formatUnits(balance, decimals)
        });
    } catch (err) {
        console.error("❌ /balance error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🔁 Transfer tokens
router.post("/transfer", async (req, res) => {
    try {
        if (!signer) throw new Error("Wallet signer missing");
        const { to, amount } = req.body;
        const token = getTokenContract(true);
        const decimals = await token.decimals();
        const tx = await token.transfer(to, parseUnits(amount.toString(), decimals));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("❌ /transfer error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🪙 Mint tokens (admin)
router.post("/mint", async (req, res) => {
    try {
        if (!signer) throw new Error("Signer not initialized");
        const { to, amount } = req.body;
        const token = getTokenContract(true);
        const decimals = await token.decimals();
        const tx = await token.mint(to, parseUnits(amount.toString(), decimals));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("❌ /mint error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🔥 Burn tokens (admin)
router.post("/burn", async (req, res) => {
    try {
        if (!signer) throw new Error("Signer not initialized");
        const { from, amount } = req.body;
        const token = getTokenContract(true);
        const decimals = await token.decimals();
        const tx = await token.burn(from, parseUnits(amount.toString(), decimals));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("❌ /burn error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Verify transaction by hash
router.get("/verify/:txHash", async (req, res) => {
    try {
        const txHash = req.params.txHash;
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) return res.status(404).json({ error: "Transaction not found" });
        res.json({
            txHash,
            blockNumber: receipt.blockNumber,
            status: receipt.status === 1 ? "✅ Success" : "❌ Failed"
        });
    } catch (err) {
        console.error("❌ /verify error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 📈 Live price feed placeholder (for frontend ticker)
router.get("/pricefeed", async (req, res) => {
    try {
        const mock = {
            symbol: "MODA",
            priceUSD: 1.02,
            change24h: 0.56,
            updated: new Date().toISOString()
        };
        res.json(mock);
    } catch (err) {
        console.error("❌ /pricefeed error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;



