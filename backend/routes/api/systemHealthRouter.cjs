// © 2025 AIMAL Global Holdings | System Health Router

const express = require("express");
const router = express.Router();
const telemetry = require("../../system/health/healthTelemetry.cjs");

router.get("/", (req, res) => {
    try {
        const status = telemetry.getStatus();
        res.json({ ok: true, system: status });
    } catch (err) {
        console.error("System Health Error:", err);
        res.json({ ok: false, safeMode: true });
    }
});

module.exports = router;
