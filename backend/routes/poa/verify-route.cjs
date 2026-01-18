/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * POA Verify + Token Issue + Revocation + Status — TRUSTEE ONLY
 *
 * NOTE:
 * - This router is mounted behind trusteeAuth in invest-api.cjs
 * - Routes here assume trustee/compliance access already enforced
 */

const express = require("express");
const { signHmac, newNonce } = require("../../security/poa/poaTokens.cjs");
const {
    revoke,
    isRevoked,
    listRevocations,
    DEFAULT_PATH,
} = require("../../security/poa/poaRevocationStore.cjs");

// CloudWatch EMF logger
const { logPoaMetrics } = require("../../../docs/observability/node_cloudwatch_emf_logger.js");

// Importing the verifyEnvelope function for signature verification
const { verifyEnvelope } = require("../../crypto/verify.cjs");

const router = express.Router();
router.use(express.json({ limit: "1mb" }));

function envName() {
    return process.env.NODE_ENV || "prod";
}

// ------------------------------
// POST /api/poa/issue
// Body: { poa_id, scope:[], ttl_seconds }
// ------------------------------
function issuePoaToken(req, res) {
    const secret = process.env.POA_TOKEN_SECRET;
    if (!secret) return res.status(500).json({ ok: false, error: "missing_POA_TOKEN_SECRET" });

    const { poa_id, scope = ["intake:init"], ttl_seconds = 3600 } = req.body || {};
    if (!poa_id) return res.status(400).json({ ok: false, error: "missing_poa_id" });

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        poa_id,
        scope,
        issuer: "MODX_TRUST",
        nonce: newNonce(),
        iat: now,
        exp: now + Number(ttl_seconds),
    };

    const token = signHmac(payload, secret);

    // EMF
    logPoaMetrics({ service: "poa-admin", env: envName(), route: "issue" }, {
        InvalidSigRate: 0,
        ReplayAttempts: 0,
        RiskScore: 0.05,
        POASuspended: 0,
    });

    return res.json({ ok: true, token, payload });
}

// For compatibility with earlier wiring
router.post("/issue", issuePoaToken);

// ------------------------------
// POST /api/poa/revoke
// Body: { poa_id, nonce?, reason? }
// ------------------------------
router.post("/revoke", (req, res) => {
    const { poa_id, nonce, reason = "unspecified", actor } = req.body || {};
    if (!poa_id && !nonce) return res.status(400).json({ ok: false, error: "missing_poa_id_or_nonce" });

    const entry = revoke(
        { poa_id, nonce, reason, actor: actor || "trustee" },
        process.env.POA_REVOCATION_PATH || DEFAULT_PATH
    );

    logPoaMetrics({ service: "poa-admin", env: envName(), route: "revoke" }, {
        InvalidSigRate: 0,
        ReplayAttempts: 0,
        RiskScore: 0.9,
        POASuspended: 1,
    });

    return res.json({ ok: true, revoked: entry });
});

// ------------------------------
// GET /api/poa/status?poa_id=...&nonce=...
// ------------------------------
router.get("/status", (req, res) => {
    const poa_id = req.query.poa_id || null;
    const nonce = req.query.nonce || null;
    if (!poa_id && !nonce) return res.status(400).json({ ok: false, error: "missing_poa_id_or_nonce" });

    const revoked = isRevoked(
        { poa_id, nonce },
        process.env.POA_REVOCATION_PATH || DEFAULT_PATH
    );

    logPoaMetrics({ service: "poa-admin", env: envName(), route: "status" }, {
        InvalidSigRate: 0,
        ReplayAttempts: 0,
        RiskScore: revoked ? 0.8 : 0.1,
        POASuspended: revoked ? 1 : 0,
    });

    return res.json({ ok: true, poa_id, nonce, revoked });
});

// ------------------------------
// GET /api/poa/revocations  (optional)
// ------------------------------
router.get("/revocations", (req, res) => {
    const revoked = listRevocations(process.env.POA_REVOCATION_PATH || DEFAULT_PATH);
    return res.json({ ok: true, count: revoked.length, revoked });
});

// ------------------------------
// POST /api/poa/verify
// Body: { envelope, signature, publicKey }
// This route verifies the signature of the provided envelope
// ------------------------------
router.post("/verify", (req, res) => {
    const { envelope, signature, publicKey } = req.body || {};

    if (!envelope || !signature || !publicKey) {
        return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    try {
        const isValid = verifyEnvelope(envelope, signature, publicKey);

        if (isValid) {
            return res.status(200).json({ ok: true, message: "Signature is valid" });
        } else {
            return res.status(400).json({ ok: false, error: "Invalid signature" });
        }
    } catch (err) {
        console.error("Error verifying envelope:", err);
        return res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = { router, issuePoaToken };
