/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED & PROTECTED.
 *
 * OVERSITE COUNCIL INGEST SYSTEM
 * -------------------------------------------------------------
 * Accepts:
 *  - Anomaly telemetry
 *  - Quantum infection alerts
 *  - Rollback preview data
 *  - PQC signature mismatches
 *  - Self-heal results
 *
 * Enforces:
 *  - Key-based authentication
 *  - Shielded endpoint (no public access)
 *  - Immutable log trail
 *  - Immediate emission to Oversite Dashboard
 */

const express = require("express");
const router = express.Router();
const { appendIntel } = require("../oversite/intelligenceStore");

module.exports = (io) => {

    const MASTER_KEY = process.env.OVERSITE_INGEST_KEY;

    /* ---------------------------------------------------------
       🔒 AUTH MIDDLEWARE
    --------------------------------------------------------- */
    router.use((req, res, next) => {
        const key = req.headers["x-oversite-key"];

        if (!key || key !== MASTER_KEY) {
            console.log("⚠ Unauthorized ingest attempt:", req.ip);
            return res.status(403).json({ error: "FORBIDDEN" });
        }

        next();
    });

    /* ---------------------------------------------------------
       🟣 ANOMALY INGEST
    --------------------------------------------------------- */
    router.post("/anomaly", (req, res) => {
        const anomaly = {
            ...req.body,
            receivedAt: Date.now(),
        };

        console.log("🟪 Oversite Ingest → Anomaly:", anomaly);

        // Emit to dashboard
        io.emit("anomaly:detected", anomaly);

        // Record in immutable intel store
        appendIntel("anomaly", anomaly);

        return res.json({ ok: true });
    });


    /* ---------------------------------------------------------
       🔥 QUANTUM INFECTION HEATMAP INGEST
    --------------------------------------------------------- */
    router.post("/heatmap", (req, res) => {
        const map = req.body;

        console.log("🟥 Oversite Ingest → Heatmap update");

        io.emit("quantum:infection:heatmap", map);
        appendIntel("heatmap", map);

        return res.json({ ok: true });
    });


    /* ---------------------------------------------------------
       🔄 ROLLBACK PREVIEW INGEST
    --------------------------------------------------------- */
    router.post("/rollback", (req, res) => {
        const preview = {
            ...req.body,
            receivedAt: Date.now(),
        };

        console.log("🔵 Oversite Ingest → Rollback preview:", preview);

        io.emit("rollback:preview", preview);
        appendIntel("rollback_preview", preview);

        return res.json({ ok: true });
    });


    /* ---------------------------------------------------------
       🟢 SELF-HEAL LOG INGEST
    --------------------------------------------------------- */
    router.post("/selfheal", (req, res) => {
        const repair = req.body;

        console.log("🟢 Oversite Ingest → Self-heal log:", repair);

        io.emit("mc:selfheal", repair);
        appendIntel("selfheal", repair);

        return res.json({ ok: true });
    });


    /* ---------------------------------------------------------
       🟣 PQC SIGNATURE MISMATCH INGEST
    --------------------------------------------------------- */
    router.post("/pqc-mismatch", (req, res) => {
        const mismatch = req.body;

        console.log("🟣 PQC Mismatch detected:", mismatch);

        io.emit("oversite:pqc:alert", mismatch);
        appendIntel("pqc_mismatch", mismatch);

        return res.json({ ok: true });
    });

    return router;
};
