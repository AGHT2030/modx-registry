/**
 * Oversite OAC Router
 */

const express = require("express");
const router = express.Router();

const { createAttestation, verifyChain } = require("../oversite/OAC");
const { verifyIdentity } = require("../oversite/pqcIdentityBinding");

const MASTER_KEY = process.env.OVERSITE_INGEST_KEY;

// -----------------------------
// AUTH
// -----------------------------
router.use((req, res, next) => {
    if (req.headers["x-oversite-key"] !== MASTER_KEY) {
        return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
});

// -----------------------------
// CREATE ATTESTATION BLOCK
// -----------------------------
router.post("/attest", (req, res) => {
    const {
        address,
        actionHash,
        pqcKey,
        deviceFingerprint,
        oathHash,
        pqcSignatureHash
    } = req.body;

    // Ensure identity is valid
    const identity = verifyIdentity({
        address,
        pqcKey,
        deviceFingerprint
    });

    if (!identity.valid) {
        return res.status(403).json({
            ok: false,
            reason: "IDENTITY_INVALID",
            details: identity.reason
        });
    }

    const block = createAttestation({
        address,
        actionHash,
        pqcSignatureHash,
        deviceFingerprintHash: cryptoHash(deviceFingerprint),
        oathHash
    });

    return res.json({ ok: true, block });
});

// -----------------------------
// VERIFY OAC CHAIN
// -----------------------------
router.get("/verify", (req, res) => {
    return res.json(verifyChain());
});

module.exports = router;
