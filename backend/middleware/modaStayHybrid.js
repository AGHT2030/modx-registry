
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

// © 2025 Mia Lopez | AIMAL Global Holdings
// MODA Stay Hybrid Handler — syncs hotel hybrid data with MODA DAO + CoinPurse

const express = require("express");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { ethers } = require("ethers");
const axios = require("axios");

const router = express.Router();

// 🧠 Environment variables
const {
    POLYGON_RPC,
    MODASTAYHYBRID_ADDRESS,
    MODASTAYHYBRID_ABI_PATH,
    COINPURSE_API,
    AURA_API_URL,
} = process.env;

// ✅ Load ABI safely
let MODA_ABI;
try {
    const abiPath =
        MODASTAYHYBRID_ABI_PATH ||
        path.resolve("backend/abis/MODAStayHybrid.json");
    MODA_ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
} catch (err) {
    console.warn("⚠️ MODAStayHybrid ABI not found:", err.message);
    MODA_ABI = null;
}

// ✅ Ethers provider and contract setup
let provider, contract;
if (POLYGON_RPC && MODASTAYHYBRID_ADDRESS && MODA_ABI) {
    provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    contract = new ethers.Contract(MODASTAYHYBRID_ADDRESS, MODA_ABI, provider);
    console.log(chalk.green("🏨 MODA Stay Hybrid contract loaded."));
} else {
    console.warn(chalk.yellow("⚠️ MODA Stay Hybrid not fully initialized — check RPC or ABI."));
}

/**
 * 🧩 Handler to sync MODA Stay bookings, DAO registry entries,
 * and update CoinPurse wallet balances for room/token holders.
 */
async function modaStayHandler(req, res, next) {
    try {
        const { bookingId, userAddress } = req.body || {};

        if (!bookingId || !userAddress) {
            return res.status(400).json({ error: "Missing bookingId or userAddress" });
        }

        console.log(chalk.blue(`📡 Syncing booking #${bookingId} for ${userAddress}`));

        // 1️⃣ Get booking data from DAO or off-chain store
        let bookingData;
        if (contract) {
            bookingData = await contract.bookings(bookingId);
        } else {
            bookingData = { status: "pending", nights: 0, roomType: "unknown" };
        }

        // 2️⃣ Log booking sync into vault
        const logDir = path.resolve("backend/vault/logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logEntry = `[${new Date().toISOString()}] Booking ${bookingId} synced for ${userAddress}\n`;
        fs.appendFileSync(`${logDir}/modaStay.log`, logEntry);

        // 3️⃣ Notify AURA Policy Advisor (if active)
        if (AURA_API_URL) {
            try {
                await axios.post(`${AURA_API_URL}/api/policy/advisor`, {
                    module: "MODAStayHybrid",
                    event: "bookingSync",
                    data: { bookingId, userAddress },
                });
                console.log(chalk.magenta("📡 AURA Policy Advisor notified."));
            } catch (err) {
                console.warn("⚠️ Could not notify AURA Advisor:", err.message);
            }
        }

        // 4️⃣ Update CoinPurse record (optional)
        if (COINPURSE_API) {
            try {
                await axios.post(`${COINPURSE_API}/api/ledger/update`, {
                    type: "MODAStayHybrid",
                    userAddress,
                    bookingId,
                    nights: bookingData.nights || 0,
                });
                console.log(chalk.green("💰 CoinPurse ledger updated."));
            } catch (err) {
                console.warn("⚠️ CoinPurse ledger update failed:", err.message);
            }
        }

        // 5️⃣ Finalize response
        res.json({
            ok: true,
            bookingId,
            userAddress,
            status: bookingData.status || "synced",
        });
    } catch (err) {
        console.error(chalk.red(`❌ MODA Stay Handler Error: ${err.message}`));
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        next && next();
    }
}

// ✅ Attach to router for Express compatibility
router.post("/moda-stay/sync", modaStayHandler);

// ✅ Health route for monitoring
router.get("/moda-stay/health", (req, res) => {
    res.json({ module: "MODAStayHybrid", status: "active", timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// ✅ Export router (so safeImport & app.use can attach it)
// -------------------------------------------------------------
module.exports = router;
