
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

// © 2025 AIMAL Global Holdings | MODLINK Event API Routes

const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../admin/adminAuth");
const {
    logEvent,
    getRecentEvents,
    getEventsByDateRange,
    clearAllEvents
} = require("../modlink/modlinkEventLogger");

// 🔍 Get latest events
router.get("/events", verifyAdmin, async (req, res) => {
    const events = await getRecentEvents(100);
    res.json({ count: events.length, events });
});

// 🔍 Range filter
router.get("/events/range", verifyAdmin, async (req, res) => {
    const { start, end } = req.query;
    const events = await getEventsByDateRange(start, end);
    res.json({ count: events.length, events });
});

// 🧹 Clear all events
router.delete("/events/clear", verifyAdmin, async (req, res) => {
    await clearAllEvents();
    res.json({ status: "cleared" });
});

// 🧾 Internal utility for other modules
router.post("/events/log", async (req, res) => {
    const { dao, type, payload, actor } = req.body;
    await logEvent({ dao, type, payload, actor, ip: req.ip });
    res.json({ status: "logged" });
});

module.exports = router;
