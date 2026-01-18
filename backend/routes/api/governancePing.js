
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
 * © 2025 Mia Lopez | AIMAL Global Holdings
 * Governance Listener Diagnostic Route
 * Confirms AURA Spectrum + Governance bridge connectivity.
 */

const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
    try {
        const auraStatus = global._aura_io
            ? "🟢 AURA Spectrum active"
            : "🔴 AURA Spectrum not initialized";

        const hasListeners =
            global.MODLINK?.dao?.ready || global._governance_listener_ready
                ? "🟢 Governance listener initialized"
                : "🔴 Governance listener inactive";

        res.json({
            status: "ok",
            aura: auraStatus,
            governance: hasListeners,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

module.exports = router;
