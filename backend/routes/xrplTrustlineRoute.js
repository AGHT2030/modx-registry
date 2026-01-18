
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

const express = require("express");
const router = express.Router();
const { autoTrustlines } = require("../xrpl/autoTrustlines");

router.post("/trustlines/add", async (req, res) => {
    try {
        const wallet = req.body.wallet; // seed or xrpSecret
        await autoTrustlines(wallet);
        res.json({ ok: true });
    } catch (err) {
        console.error("❌ Trustline route error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
