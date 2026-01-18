/**
 * © 2025 AG Holdings Trust | Crisis Action Routes
 * Connected to Crisis Control Panel in Admin UI.
 */

const express = require("express");
const router = express.Router();

const C5 = require("../sentinel/C5_Engine.cjs");
const C5Propagation = require("../sentinel/C5_RouterPropagation.cjs");
const QuantumSentinel = require("../sentinel/QuantumSentinel.cjs");
const PQC = require("../security/pqc/PQC_Engine.cjs");

// Ensure globals exist
global.ETF_FROZEN = global.ETF_FROZEN || false;
global.AUDIT_MODE = global.AUDIT_MODE || false;
global.LOCKDOWN = global.LOCKDOWN || false;

/* ───────────────────────────────────────────────────────────────
   Freeze ETFs (manual)
──────────────────────────────────────────────────────────────── */
router.post("/freeze-etf", (req, res) => {
    global.ETF_FROZEN = true;
    global.IO.emit("etf:freeze");

    return res.json({ message: "ETF operations have been frozen." });
});

/* ───────────────────────────────────────────────────────────────
   Unfreeze ETFs (manual)
──────────────────────────────────────────────────────────────── */
router.post("/unfreeze-etf", (req, res) => {
    global.ETF_FROZEN = false;
    global.IO.emit("etf:unfreeze");

    return res.json({ message: "ETF operations have been restored." });
});

/* ───────────────────────────────────────────────────────────────
   Enable Audit Mode
──────────────────────────────────────────────────────────────── */
router.post("/enable-audit", (req, res) => {
    global.AUDIT_MODE = true;

    return res.json({ message: "Audit Mode has been activated." });
});

/* ───────────────────────────────────────────────────────────────
   Reset PQC Identity Rail
──────────────────────────────────────────────────────────────── */
router.post("/reset-pqc", (req, res) => {
    PQC.rotateKeys();

    return res.json({ message: "PQC Rail keys reset successfully." });
});

/* ───────────────────────────────────────────────────────────────
   Unlock system (override Lockdown)
──────────────────────────────────────────────────────────────── */
router.post("/unlock-system", (req, res) => {
    global.LOCKDOWN = false;

    C5Propagation.apply("NORMAL");
    global.IO.emit("c5:threat:update", {
        threat: "NORMAL",
        throttle: 1,
        lockdown: false,
        etfFrozen: global.ETF_FROZEN
    });

    return res.json({ message: "System lockdown has been overridden." });
});

module.exports = router;
