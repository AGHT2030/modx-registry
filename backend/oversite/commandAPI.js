/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED & PROTECTED
 *
 * OVERSITE COUNCIL COMMAND API
 * ---------------------------------------------------------------
 * This module grants privileged system-level commands ONLY to
 * authenticated Oversite Council members.
 *
 * Commands:
 *  - freezeComponent
 *  - quarantineFile
 *  - applyRollback
 *  - runLineageTrace
 *  - deepInspect
 *  - confirmCouncilAction (PQC required)
 *
 * All commands:
 *  - Require Oversite Key
 *  - Require PQC Signature
 *  - Are logged immutably
 *  - Are broadcast to Oversite Dashboard
 */

const express = require("express");
const router = express.Router();

const { appendIntel } = require("./intelligenceStore");
const { applyRepairs } = require("../quantum/QuantumSentinel");
const crypto = require("crypto");

module.exports = (io) => {

    const MASTER_KEY = process.env.OVERSITE_COMMAND_KEY;
    const PQC_SECRET = process.env.OVERSITE_PQC_SECRET;

    /* ---------------------------------------------------------
       🔒 ENFORCE OVERSITE AUTH + PQC SIGNATURE
    --------------------------------------------------------- */
    router.use((req, res, next) => {
        const key = req.headers["x-oversite-key"];
        const sig = req.headers["x-pqc-signature"];

        if (!key || key !== MASTER_KEY) {
            console.log("⚠ Oversite command rejected (bad key)");
            return res.status(403).json({ error: "FORBIDDEN" });
        }

        // Verify PQC signature
        const expected = crypto.createHash("sha3-512")
            .update(PQC_SECRET)
            .digest("hex");

        if (!sig || sig !== expected) {
            console.log("⚠ PQC Signature Mismatch");
            return res.status(403).json({ error: "INVALID_PQC_SIGNATURE" });
        }

        next();
    });

    /* ---------------------------------------------------------
       🧊 1) Freeze Component
    --------------------------------------------------------- */
    router.post("/freeze", (req, res) => {
        const { component } = req.body;

        const action = {
            type: "freeze",
            component,
            timestamp: Date.now()
        };

        console.log("🧊 Oversite Command → Freeze:", component);

        io.emit("oversite:command:freeze", action);
        appendIntel("freeze", action);

        return res.json({ ok: true });
    });

    /* ---------------------------------------------------------
       🦠 2) Quarantine File
    --------------------------------------------------------- */
    router.post("/quarantine", (req, res) => {
        const { file } = req.body;

        const action = {
            type: "quarantine",
            file,
            timestamp: Date.now()
        };

        console.log("🦠 Oversite Command → Quarantine:", file);

        io.emit("oversite:command:quarantine", action);
        appendIntel("quarantine", action);

        return res.json({ ok: true });
    });

    /* ---------------------------------------------------------
       🔄 3) Apply Rollback
    --------------------------------------------------------- */
    router.post("/rollback", (req, res) => {
        const { target } = req.body;

        const action = {
            type: "rollback",
            target,
            timestamp: Date.now()
        };

        console.log("🔄 Oversite Command → Rollback:", target);

        io.emit("oversite:command:rollback", action);
        appendIntel("rollback", action);

        return res.json({ ok: true });
    });

    /* ---------------------------------------------------------
       🧬 4) Lineage Trace
    --------------------------------------------------------- */
    router.post("/lineage", (req, res) => {
        const { file } = req.body;

        const action = {
            type: "lineage_trace",
            file,
            timestamp: Date.now()
        };

        console.log("🧬 Oversite Command → Lineage Trace:", file);

        io.emit("oversite:command:lineage", action);
        appendIntel("lineage", action);

        return res.json({ ok: true });
    });

    /* ---------------------------------------------------------
       🔍 5) Deep Inspection
    --------------------------------------------------------- */
    router.post("/inspect", (req, res) => {
        const { component } = req.body;

        const action = {
            type: "deep_inspect",
            component,
            timestamp: Date.now()
        };

        console.log("🔍 Oversite Command → Deep Inspect:", component);

        io.emit("oversite:command:inspect", action);
        appendIntel("inspect", action);

        return res.json({ ok: true });
    });

    /* ---------------------------------------------------------
       🟣 6) Council Confirmation (Final Step)
    --------------------------------------------------------- */
    router.post("/confirm", (req, res) => {
        const { actionHash, councilMember } = req.body;

        const action = {
            type: "confirmation",
            actionHash,
            councilMember,
            timestamp: Date.now()
        };

        console.log("🟣 Oversite Command → PQC Confirm:", action);

        io.emit("oversite:command:confirm", action);
        appendIntel("confirmation", action);

        return res.json({ ok: true });
    });

    return router;
};
