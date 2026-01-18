
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
 * © 2025 Mia Lopez | C5 Governance REST API
 * Exposes unified threat feed, heatmap, and event history.
 */

const express = require("express");
const router = express.Router();

const { processC5 } = require("../../modx/governance/c5-threat-engine");

// Internal state
let C5_BUFFER = [];          // last 50 threats
let C5_HISTORY = [];         // full historical record
let HEAT_VALUE = 100;

/* ------------------------------------------------------
   🔄 PIPELINE HOOK — Called by XRPL/EVM/MODX listeners
------------------------------------------------------ */
async function ingestC5(evt) {
    const packet = await processC5(evt);

    HEAT_VALUE = packet.heatValue;

    // keep last 50 in buffer
    C5_BUFFER.push(packet);
    if (C5_BUFFER.length > 50) C5_BUFFER.shift();

    // full history
    C5_HISTORY.push(packet);

    return packet;
}

// expose for backend ingestion
router.ingest = ingestC5;

/* ------------------------------------------------------
   🌡️ GET — Current Heat Score
   (Used by dashboards, AURA Twins, Compliance UI)
------------------------------------------------------ */
router.get("/heatmap", (req, res) => {
    res.json({
        ok: true,
        heatScore: HEAT_VALUE,
        scale: "0=critical, 100=normal",
        timestamp: new Date().toISOString()
    });
});

/* ------------------------------------------------------
   📡 GET — Live Feed (Last 50 C5 Events)
------------------------------------------------------ */
router.get("/feed", (req, res) => {
    res.json({
        ok: true,
        count: C5_BUFFER.length,
        events: C5_BUFFER
    });
});

/* ------------------------------------------------------
   🕰️ GET — Full C5 History (Paged)
------------------------------------------------------ */
router.get("/history", (req, res) => {
    const page = parseInt(req.query.page || "1");
    const size = parseInt(req.query.size || "25");

    const start = (page - 1) * size;
    const end = start + size;

    res.json({
        ok: true,
        page,
        size,
        total: C5_HISTORY.length,
        events: C5_HISTORY.slice(start, end)
    });
});

/* ------------------------------------------------------
   🔍 GET — Detailed Threat by ID
------------------------------------------------------ */
router.get("/event/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const found = C5_HISTORY.find((e) => e.classification?.threatId === id);

    if (!found) {
        return res.status(404).json({ ok: false, error: "Not found" });
    }

    res.json({ ok: true, event: found });
});

/* ------------------------------------------------------
   📢 Broadcast Sync for Dashboards (Optional Hook)
------------------------------------------------------ */
router.get("/sync", (req, res) => {
    if (global.io) {
        global.io.emit("governance:c5:sync", {
            heatScore: HEAT_VALUE,
            events: C5_BUFFER
        });
    }
    res.json({ ok: true, message: "Broadcasted to all dashboards." });
});

module.exports = router;
