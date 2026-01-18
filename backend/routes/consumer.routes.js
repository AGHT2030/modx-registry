// backend/routes/consumer.routes.js
const express = require("express");
const router = express.Router();
const { getConsumerModeConfig } = require("../mode/consumerMode");

// These should point to your existing storage/db helpers.
// For now, they can serve static JSON from /assets/events/<eventId>/...
const path = require("path");
const fs = require("fs");

function safeReadJson(p) {
    try { return JSON.parse(fs.readFileSync(p, "utf8")); }
    catch { return null; }
}

router.get("/status", (req, res) => {
    return res.json({ ok: true, consumer: getConsumerModeConfig() });
});

router.get("/:eventId/schedules", (req, res) => {
    const cfg = getConsumerModeConfig();
    if (!cfg.isLive) return res.status(403).json({ ok: false, error: "Consumer mode not live yet" });

    const eventId = req.params.eventId || cfg.defaultEventId;
    const p = path.join(process.cwd(), "assets", "events", eventId, "schedules.json");
    const data = safeReadJson(p);
    if (!data) return res.status(404).json({ ok: false, error: "Missing schedules.json" });
    return res.json({ ok: true, eventId, data });
});

router.get("/:eventId/maps", (req, res) => {
    const cfg = getConsumerModeConfig();
    if (!cfg.isLive) return res.status(403).json({ ok: false, error: "Consumer mode not live yet" });

    const eventId = req.params.eventId || cfg.defaultEventId;
    const p = path.join(process.cwd(), "assets", "events", eventId, "maps.json");
    const data = safeReadJson(p);
    if (!data) return res.status(404).json({ ok: false, error: "Missing maps.json" });
    return res.json({ ok: true, eventId, data });
});

module.exports = router;
