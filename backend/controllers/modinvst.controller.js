
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

import { ethers } from "ethers";
import MODINVST from "../models/MODINVST.model.js";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.providers.WebSocketProvider(
    process.env.ALCHEMY_RPC_URL.replace("https", "wss")
);
const contractAddress = process.env.MODINVST_CONTRACT;
const abi = [
    "event PortfolioUpdated(string fund, uint256 value, string change)"
];
const contract = new ethers.Contract(contractAddress, abi, provider);

// 🧠 Watchchain Sync: Listen for PortfolioUpdated events
contract.on("PortfolioUpdated", async (fund, value, change) => {
    console.log(`📈 MODINVST event: ${fund} = ${value} (${change})`);
    await MODINVST.create({ fund, value: Number(value), change });
});

// ✅ Get current portfolio snapshot
export async function getPortfolio(req, res) {
    try {
        const data = await MODINVST.find().sort({ timestamp: -1 }).limit(50);
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ✅ Manual rebalance trigger (future DAO integration)
export async function rebalance(req, res) {
    try {
        const { fund, newValue, change } = req.body;
        const updated = await MODINVST.create({ fund, value: newValue, change });
        res.json({ success: true, updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

