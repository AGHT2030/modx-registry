
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// © 2025 Mia Lopez | CoinPurse™ MODAM API
const express = require("express");
const router = express.Router();
const { contracts, getTokenBalance } = require("../services/blockchain");

// Treasury wallet (for MODAM community fund)
const MODAM_TREASURY = process.env.MODAM_TREASURY;

router.get("/overview", async (req, res) => {
    try {
        const [modx, modam] = await Promise.all([
            getTokenBalance(contracts.MODX, MODAM_TREASURY),
            getTokenBalance(contracts.MODAM, MODAM_TREASURY),
        ]);

        res.json({
            modx,
            modam,
            collaborations: [
                "CreaTV", "MODA Museum", "MODXSTY", "MODAPLY",
                "MODUSD", "MODRetail", "AIRS"
            ],
            description: "MODA Mobility bridges NFTs, retail, corporate, government, private, education and creatives to real-world wealth building."
        });
    } catch (err) {
        console.error("Error fetching MODAM data:", err);
        res.status(500).json({ error: "Unable to fetch MODAM stats" });
    }
});

module.exports = router;



