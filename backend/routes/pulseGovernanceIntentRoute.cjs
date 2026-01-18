// © 2025 AG Holdings Trust | MODX Sovereign Technologies
// PULSE Governance Intent Endpoint (read-only safe by default)

"use strict";

const express = require("express");
const router = express.Router();

function sovereignGuard(req, res, next) {
    const frozen = process.env.MODX_FROZEN === "true";
    if (frozen) {
        // still allow receiving intents, but do NOT execute anything
        req.MODX_FROZEN = true;
    }
    next();
}

router.post("/api/pulse/intent", sovereignGuard, (req, res) => {
    const body = req.body || {};

    // hard block raw identity fields
    if (body?.rawIdentity || body?.ssn || body?.passportNumber) {
        return res.status(400).json({ ok: false, reason: "RAW_IDENTITY_REJECTED" });
    }

    // store nowhere by default; emit to internal bus later (Phase 4+)
    return res.json({
        ok: true,
        frozen: !!req.MODX_FROZEN,
        accepted: true,
        mode: "INTENT_ONLY_NO_EXECUTION",
        receivedAt: Date.now()
    });
});

module.exports = { router };
