
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

// © 2025 AIMAL Global Holdings | CoinPurse™ Production Route
// 📁 backend/routes/investment/intake-route.cjs
// Description: Production intake route with XRPL ledger monitoring and AGVault persistence

const express = require("express");
const fs = require("fs");
const path = require("path");
const xrpl = require("xrpl");
const dotenv = require("dotenv");
const router = express.Router();

// 🔹 Load environment
dotenv.config({ path: process.env.ENV_PATH || ".env.override" });

// 🔹 Vault Path Setup
const vaultBase = process.env.VAULT_PATH || path.resolve("C:/Users/mialo/AGVault/investment/projects");

// Ensure directory exists
if (!fs.existsSync(vaultBase)) fs.mkdirSync(vaultBase, { recursive: true });

// 🔹 XRPL Connection
const client = new xrpl.Client(process.env.XRPL_WS || "wss://xrplcluster.com");

async function connectXRPL() {
    try {
        if (!client.isConnected()) await client.connect();
        console.log("✅ Connected to XRPL Ledger (Production)");
    } catch (err) {
        console.error("❌ XRPL Connection Error:", err.message);
    }
}

// 🔹 Helper: Write to Vault
function writeVault(category, data) {
    const filename = `${category}-${Date.now()}.json`;
    const filePath = path.join(vaultBase, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filePath;
}

// 🔹 POST /api/investment/intake
router.post("/intake", async (req, res) => {
    const payload = req.body || {};
    const { investor, project, amount, xrplAddress } = payload;

    try {
        await connectXRPL();

        // Verify XRPL Address (Optional Step)
        const isValid = xrpl.isValidAddress(xrplAddress);
        if (!isValid) {
            return res.status(400).json({ ok: false, error: "Invalid XRPL address" });
        }

        // Generate Ledger Monitor
        client.on("ledgerClosed", (ledger) => {
            console.log(`📘 XRPL Ledger Closed: ${ledger.ledger_index}`);
        });

        // Subscribe to Account Events
        await client.request({
            command: "subscribe",
            accounts: [xrplAddress],
        });

        client.on("transaction", (tx) => {
            if (tx.transaction && tx.transaction.Account === xrplAddress) {
                console.log("💸 Incoming XRPL Transaction:", tx.transaction);
                writeVault("xrpl-tx", tx.transaction);
            }
        });

        // Save Intake Request
        const filePath = writeVault("intake", { timestamp: new Date(), investor, project, amount, xrplAddress });
        console.log(`✅ Vault Write Successful: ${filePath}`);

        res.json({
            ok: true,
            message: "Intake processed and XRPL listener active",
            vaultFile: filePath,
        });
    } catch (err) {
        console.error("❌ Intake Error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// 🔹 Health Check
router.get("/health", async (req, res) => {
    const connected = client.isConnected();
    res.json({
        ok: true,
        status: connected ? "XRPL Connected" : "XRPL Disconnected",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
