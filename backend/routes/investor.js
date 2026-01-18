
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
"use strict";

/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 */

const express = require("express");
const router = express.Router();
const { contracts, getTokenBalance } = require("../services/blockchain");

const GP_TREASURY = process.env.GP_TREASURY_WALLET;

// --------------------------------------------------
// HARD PRE-GUARD (INVEST IS GOVERNED)
// --------------------------------------------------
function denyIfMissingModlinkProof(req, res, next) {
    if (!req.headers["x-modlink-proof"]) {
        return res.status(403).json({
            error: "GOVERNANCE_DENIED",
            reason: "DENY_MISSING_MODLINK_PROOF"
        });
    }
    next();
}

// --------------------------------------------------
// READ-ONLY BALANCES (STILL GOVERNED)
// --------------------------------------------------
router.get("/balances", denyIfMissingModlinkProof, async (req, res) => {
    try {
        const balances = {};
        for (const [name, address] of Object.entries(contracts)) {
            balances[name] = await getTokenBalance(address, GP_TREASURY);
        }
        res.json(balances);
    } catch (err) {
        console.error("Investor balance fetch failed:", err);
        res.status(500).json({ error: "Unable to fetch balances" });
    }
});

module.exports = router;



