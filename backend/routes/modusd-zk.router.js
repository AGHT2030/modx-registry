
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
const zk = require("../services/modusd-zk");
const adapter = require("../modlink/adapters/modusd-zk.adapter");

// Generate proof
router.post("/api/coinpurse/zk/modusd/prove", async (req, res) => {
    try {
        const proof = await zk.generateProof(req.body);

        // Broadcast through MODLINK or queue offline
        await adapter.broadcastEvent("zk:proof_generated", {
            proofHash: proof.hash,
            supply: req.body.supply
        });

        res.json({ ok: true, proof });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Verify proof
router.post("/api/coinpurse/zk/modusd/verify", async (req, res) => {
    try {
        const result = await zk.verifyProof(req.body);

        await adapter.broadcastEvent("zk:proof_verified", {
            valid: result.valid,
            public: result.public
        });

        res.json({ ok: true, result });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
