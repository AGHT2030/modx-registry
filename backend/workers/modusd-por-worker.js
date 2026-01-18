
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

// © 2025 AIMAL Global Holdings | MODUSD PoR Worker (ZK → API → MODLINK)
// Watches proof.json + public.json and forwards them into the MODUSD PoR Router.

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const PROOF_PATH = path.join(__dirname, "../../zk/proofs/modusd/proof.json");
const PUBLIC_PATH = path.join(__dirname, "../../zk/proofs/modusd/public.json");
const META_PATH = path.join(__dirname, "../../zk/proofs/modusd/meta.json");

// API endpoint (your unified router)
const POR_ENDPOINT = process.env.POR_ENDPOINT ||
    "http://localhost:8083/api/modusd/por/submit";

// Sleep helper
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

console.log("⚡ MODUSD PoR Worker running…");
console.log("   Watching:", PROOF_PATH);
console.log("   Endpoint:", POR_ENDPOINT);

async function loadJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        console.error("❌ Failed to load JSON:", filePath, err);
        return null;
    }
}

async function sendPoR() {
    const proof = await loadJSON(PROOF_PATH);
    const publicSignals = await loadJSON(PUBLIC_PATH);
    const meta = await loadJSON(META_PATH);

    if (!proof || !publicSignals) {
        console.log("⏳ PoR artifacts missing… waiting.");
        return;
    }

    try {
        console.log("🚀 Sending PoR packet →", POR_ENDPOINT);

        const res = await axios.post(POR_ENDPOINT, {
            proof,
            publicSignals,
            meta: meta || {
                reserve_xrpl: null,
                reserve_bank: null,
                supply: null,
                asOfBlock: "unknown",
                network: process.env.XRPL_NETWORK || "xrpl-testnet",
                source: "MODUSD_POR_WORKER",
            },
        });

        if (res.data?.status === "DELIVERED") {
            console.log("🟢 PoR delivered to MODLINK → Universe Gateway.");
        } else if (res.status === 202) {
            console.log("🟡 PoR queued (MODLINK offline).");
        } else {
            console.log("📨 PoR submitted:", res.data);
        }

    } catch (err) {
        console.error("❌ Error sending PoR:", err.message);
    }
}

// -------------------------------------------------------------
// 👀 Watch the zk proof directory for updates
// -------------------------------------------------------------
async function watchLoop() {
    while (true) {
        await sendPoR();
        await wait(5000); // every 5s check for new proofs
    }
}

watchLoop();
