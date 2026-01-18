
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

/**
 * © 2025 Mia Lopez | Swap API Endpoint
 */

const express = require("express");
const router = express.Router();
const { executeSwap } = require("../modules/swapRouter.cjs");

router.post("/", async (req, res) => {
    try {
        const { token, amount, direction, account } = req.body;

        const result = await executeSwap({
            token,
            amount,
            direction,
            account
        });

        res.json({ ok: true, swap: result });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

module.exports = router;
