
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

// © 2025 AIMAL Global Holdings | AURA Drift Test Route (CJS)
const express = require("express");
const router = express.Router();
const os = require("os");

const Cognitive = require("../../aura/cognitiveDriftIndex");
const { estimateDriftRecovery } = require("../../aura/driftRecoveryPredictor");

// 🔍  GET /api/aura/test-drift
router.get("/test-drift", async (req, res) => {
    try {
        const ariEmotion = Math.random();
        const agadorEmotion = Math.random();
        const drift = Cognitive.calculateCognitiveDrift(ariEmotion, agadorEmotion);

        global.driftHistory = [
            ...(global.driftHistory || []).slice(-20),
            { divergence: drift, timestamp: new Date().toISOString() },
        ];

        const recovery = estimateDriftRecovery(global.driftHistory);
        const cpu = os.loadavg()[0].toFixed(2);
        const memory = Math.round((os.totalmem() - os.freemem()) / (1024 * 1024));

        const payload = {
            timestamp: new Date().toISOString(),
            cpu,
            memory,
            drift,
            recovery,
        };

        // push live metrics to the realtime clients if connected
        if (global.auraIO) {
            global.auraIO.emit("aura:test:drift", payload);
        }

        console.log("🧪 AURA Drift Test →", payload);
        res.json({ ok: true, payload });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
