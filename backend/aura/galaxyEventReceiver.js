
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

// © 2025 AIMAL Global Holdings | AURA Galaxy Core
// Receives DAO Bridge events → routes into:
//   • Outlier Sentinel
//   • Twins Policy Advisor
//   • Cognitive Metrics
//   • Business Risk Engine

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Pipe into Sentinel & Twins
const sentinel = require("../modx/governance/outlierSentinel.cjs");
const twinsAdvisor = require("../modx/governance/twinsPolicyAdvisor.cjs");

const CACHE_PATH = path.join(__dirname, "../vault/galaxyIngestCache.json");

// Utility: Write fallback logs
function cacheIngest(event) {
    try {
        const existing = fs.existsSync(CACHE_PATH)
            ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"))
            : [];
        existing.push({ ...event, timestamp: Date.now() });
        fs.writeFileSync(CACHE_PATH, JSON.stringify(existing, null, 2));
    } catch (err) {
        console.error("❌ Failed to write ingest cache:", err.message);
    }
}

// ------------------------------------------------------------
// GALAXY INGEST ENDPOINT
// ------------------------------------------------------------
router.post("/galaxy/event", async (req, res) => {
    const event = req.body || {};

    console.log("🌌 [GALAXY] Received DAO Event:", event);

    // Validate payload
    if (!event.type || !event.dao) {
        cacheIngest({ error: "invalid_event", raw: event });
        return res.status(400).json({ ok: false });
    }

    // 1️⃣ Outlier Sentinel Scoring
    try {
        const sentinelResult = await sentinel.evaluateImpact(event, {});
        console.log("🛰️ Sentinel Score:", sentinelResult);
    } catch (err) {
        console.error("⚠ Sentinel failed:", err.message);
        cacheIngest({ error: "sentinel_fail", event });
    }

    // 2️⃣ Twins Policy Advisor Recommendations
    try {
        const advisory = await twinsAdvisor.generateAdvice(event);
        console.log("👯 Twins Advisory:", advisory);

        // Broadcast to all frontends
        global.io.emit("policy:advisory:update", advisory);

    } catch (err) {
        console.error("⚠ Twins Advisor failed:", err.message);
        cacheIngest({ error: "advisor_fail", event });
    }

    return res.json({ ok: true });
});

module.exports = router;
