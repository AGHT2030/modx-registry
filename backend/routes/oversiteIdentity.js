/**
 * PQC Identity Binding Router — Oversite Council Only
 */

const express = require("express");
const router = express.Router();

const { bindIdentity, verifyIdentity } = require("../oversite/pqcIdentityBinding");

const MASTER_KEY = process.env.OVERSITE_INGEST_KEY;

// -----------------------------
// AUTH MIDDLEWARE
// -----------------------------
router.use((req, res, next) => {
    if (req.headers["x-oversite-key"] !== MASTER_KEY) {
        return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
});

// -----------------------------
// REGISTER PQC IDENTITY
// -----------------------------
router.post("/bind", (req, res) => {
    const { address, oathHash, pqcKey, deviceFingerprint } = req.body;

    const bound = bindIdentity({
        address,
        oathHash,
        pqcKey,
        deviceFingerprint
    });

    return res.json({ ok: true, bound });
});

// -----------------------------
// VERIFY PQC + DEVICE IDENTITY
// -----------------------------
router.post("/verify", (req, res) => {
    const result = verifyIdentity(req.body);
    return res.json(result);
});

module.exports = router;
