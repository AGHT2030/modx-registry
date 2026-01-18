
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

// © 2025 AIMAL Global Holdings | MODX PQC TX Signer
// Dual-Layer Signature: ECDSA (chain) + Dilithium (PQC)

const express = require("express");
const router = express.Router();
const { pqcSign } = require("../../middleware/pqcMiddleware");

// Your classical blockchain signer (already exists)
const { classicalSign } = require("../../utils/blockchainSigner");

router.post("/sign", async (req, res) => {
    try {
        const payload = req.body;

        // 🔵 ECDSA (required by chain)
        const chainSig = await classicalSign(payload);

        // 🔐 PQC signature (Dilithium3)
        const pqc = pqcSign(payload);

        return res.json({
            ok: true,
            chainSig,
            pqc,
            timestamp: Date.now()
        });

    } catch (err) {
        console.error("TX signing error:", err);
        return res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
