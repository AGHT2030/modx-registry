
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

// © 2025 Mia Lopez | Polygon Sync for MODE
import Web3 from "web3";
import MODE_ABI from "../../frontend/src/modules/MODE_ALL/MODE_ABI.json" assert { type: "json" };

const web3 = new Web3(process.env.POLYGON_RPC_URL);
const MODE_CONTRACT = new web3.eth.Contract(
    MODE_ABI,
    process.env.MODE_CONTRACT_ADDRESS
);

export const syncPolygonEvent = async (event) => {
    try {
        const data = await MODE_CONTRACT.methods
            .logEventCreation(event._id, event.title)
            .send({ from: process.env.ADMIN_WALLET });
        console.log("✅ Polygon synced:", data.transactionHash);
    } catch (err) {
        console.error("❌ Polygon sync failed:", err.message);
    }
};

