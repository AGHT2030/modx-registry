
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
 * © 2025 Mia Lopez | C4 Governance Dashboard API
 * Real-time cross-chain governance dashboard:
 * XRPL + EVM + MODLINK → Sentinel + Twins + Compliance Inbox.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const LOG_FILE = path.join(
    __dirname,
    "../../../modx/governance/c4-governance-log.json"
);

function loadLog() {
    try {
        if (!fs.existsSync(LOG_FILE)) return [];
        return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
    } catch (err) {
        console.warn("⚠️ C4 log read failed:", err.message);
        return [];
    }
}

/* -------------------------------------------------------
   📌 GET: ALL EVENTS (paginated)
------------------------------------------------------- */
router.get("/events", (req, res) => {
    const page = parseInt(req.query.page || 1);
    const size = parseInt(req.query.size || 50);

    const data = loadLog().reverse();

    const slice = data.slice((page - 1) * size, page * size);

    res.json({
        ok: true,
        page,
        size,
        total: data.length,
        events: slice
    });
});

/* -------------------------------------------------------
   📌 GET: RECENT (last 25)
------------------------------------------------------- */
router.get("/recent", (req, res) => {
    const data = loadLog().reverse().slice(0, 25);
    res.json({ ok: true, events: data });
});

/* -------------------------------------------------------
   📌 GET: SUMMARY METRICS
------------------------------------------------------- */
router.get("/summary", (req, res) => {
    const data = loadLog();

    const xrpl = data.filter(e => e.chain === "XRPL").length;
    const evm = data.filter(e => e.chain === "EVM").length;
    const mod = data.filter(e => e.chain === "MODLINK").length;

    const avgRisk =
        data.reduce((a, b) => a + (b?.risk?.score || 0), 0) /
        Math.max(data.length, 1);

    res.json({
        ok: true,
        totals: { xrpl, evm, modlink: mod },
        avgRisk: Number(avgRisk.toFixed(2)),
        lastEvent: data[data.length - 1] || null
    });
});

/* -------------------------------------------------------
   📌 GET: CHAIN HEALTH (per chain)
------------------------------------------------------- */
router.get("/metrics", (req, res) => {
    const data = loadLog();

    function chainStats(chain) {
        const items = data.filter(e => e.chain === chain);
        const risk =
            items.reduce((a, b) => a + (b?.risk?.score || 0), 0) /
            Math.max(items.length, 1);

        return {
            count: items.length,
            avgRisk: Number(risk.toFixed(2)),
            last: items[items.length - 1] || null
        };
    }

    res.json({
        ok: true,
        XRPL: chainStats("XRPL"),
        EVM: chainStats("EVM"),
        MODLINK: chainStats("MODLINK")
    });
});

module.exports = router;
