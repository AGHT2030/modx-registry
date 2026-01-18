"use strict";

/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * DAO Commit Route — Authoritative (A3: Persistence + Ledger Write)
 *
 * Mount expectation:
 *   app.use("/api/dao", require("../routes/dao/commit-route.cjs"));
 *
 * Endpoints (relative to mount):
 *   POST /commit         -> validate + verify + replay-protect + persist
 *   GET  /commit/health  -> route health
 *   GET  /commit/index   -> read-only index (optional, safe)
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

// ─────────────────────────────────────────────
// Paths (WSL-safe defaults)
// ─────────────────────────────────────────────
const ledgerDir =
    process.env.DAO_LEDGER_PATH || "/mnt/c/Users/mialo/AGVault/dao/ledger";

const indexPath = path.join(ledgerDir, "index.json");

// Optional: public key for signature verification
// (should match the private key used by INVEST signing)
// Example: /mnt/c/Users/mialo/AGVault/keys/dao_commit_pub.pem
const pubPemPath = process.env.DAO_COMMIT_PUB_PEM || "";

// Dry-run switch (ONLY for early testing)
// If true, signature="INVALID_SIGNATURE" will return 401 unless this is enabled.
const allowInvalidSignature = process.env.DAO_ALLOW_INVALID_SIGNATURE === "true";

// ─────────────────────────────────────────────
// Ensure ledger directory exists
// ─────────────────────────────────────────────
if (!fs.existsSync(ledgerDir)) {
    fs.mkdirSync(ledgerDir, { recursive: true });
}

// ─────────────────────────────────────────────
// Stable stringify (canonical JSON) for hashing/verifying
// Ensures deterministic key ordering across Node runs
// ─────────────────────────────────────────────
function stableStringify(obj) {
    if (obj === null || obj === undefined) return "null";
    if (typeof obj !== "object") return JSON.stringify(obj);

    if (Array.isArray(obj)) {
        return "[" + obj.map(stableStringify).join(",") + "]";
    }

    const keys = Object.keys(obj).sort();
    const parts = [];
    for (const k of keys) {
        parts.push(JSON.stringify(k) + ":" + stableStringify(obj[k]));
    }
    return "{" + parts.join(",") + "}";
}

// ─────────────────────────────────────────────
// Load or initialize index
// index.commits: idempotencyKey -> { ts, nonce, hash, file }
// index.nonces:  nonce -> { ts, idempotencyKey }
// ─────────────────────────────────────────────
function loadIndex() {
    if (!fs.existsSync(indexPath)) {
        return {
            version: "1.0",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            commits: {},
            nonces: {}
        };
    }

    try {
        const raw = fs.readFileSync(indexPath, "utf8");
        const parsed = JSON.parse(raw);

        // Hardening: ensure required shapes exist
        if (!parsed || typeof parsed !== "object") throw new Error("Index corrupted");
        if (!parsed.commits || typeof parsed.commits !== "object") parsed.commits = {};
        if (!parsed.nonces || typeof parsed.nonces !== "object") parsed.nonces = {};

        return parsed;
    } catch (e) {
        // If index is corrupted, fail closed (authoritative system)
        throw new Error(`DAO_INDEX_LOAD_FAILED: ${e.message}`);
    }
}

function saveIndex(indexObj) {
    indexObj.updatedAt = new Date().toISOString();
    fs.writeFileSync(indexPath, JSON.stringify(indexObj, null, 2));
}

// ─────────────────────────────────────────────
// Signature verification (RSA/ECDSA depending on key)
// We verify over the envelope WITHOUT the signature field.
// algo: "sha256" with PEM key via crypto.verify
// ─────────────────────────────────────────────
function verifySignatureOrThrow(envelope) {
    // If signature is intentionally invalid for dry-run testing
    if (envelope.signature === "INVALID_SIGNATURE") {
        if (allowInvalidSignature) {
            return { verified: false, reason: "ALLOW_INVALID_SIGNATURE_ENABLED" };
        }
        throw new Error("INVALID_SIGNATURE");
    }

    // If no public key configured, fail closed in production,
    // but allow in DEV if explicitly permitted.
    if (!pubPemPath) {
        // Fail closed by default (authoritative).
        // If you *must* allow no key in dev, set DAO_ALLOW_NO_PUBKEY=true.
        const allowNoPubkey = process.env.DAO_ALLOW_NO_PUBKEY === "true";
        if (allowNoPubkey) {
            return { verified: false, reason: "NO_PUBKEY_CONFIGURED_ALLOW_NO_PUBKEY" };
        }
        throw new Error("MISSING_DAO_COMMIT_PUB_PEM");
    }

    if (!fs.existsSync(pubPemPath)) {
        throw new Error("DAO_COMMIT_PUB_PEM_NOT_FOUND");
    }

    const pubPem = fs.readFileSync(pubPemPath, "utf8");

    // Canonical message: envelope without signature
    const unsigned = {
        type: envelope.type,
        version: envelope.version,
        ts: envelope.ts,
        nonce: envelope.nonce,
        idempotencyKey: envelope.idempotencyKey,
        payload: envelope.payload
    };

    const message = stableStringify(unsigned);
    const sigBuf = Buffer.from(envelope.signature, "base64");

    let verified = false;
    try {
        verified = crypto.verify("sha256", Buffer.from(message, "utf8"), pubPem, sigBuf);
    } catch (e) {
        throw new Error(`SIGNATURE_VERIFY_ERROR: ${e.message}`);
    }

    if (!verified) {
        throw new Error("INVALID_SIGNATURE");
    }

    return { verified: true };
}

// ─────────────────────────────────────────────
// Hash (authoritative commit hash)
// ─────────────────────────────────────────────
function sha256Hex(str) {
    return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

// ─────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────
router.get("/commit/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        route: "dao/commit",
        ledgerDir,
        indexPath,
        hasPubKey: Boolean(pubPemPath),
        allowInvalidSignature,
        time: new Date().toISOString()
    });
});

// Optional: read-only index (safe for internal use)
// If you don’t want this exposed, set DAO_EXPOSE_INDEX=false
router.get("/commit/index", (_req, res) => {
    if (process.env.DAO_EXPOSE_INDEX === "false") {
        return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }

    const indexObj = loadIndex();
    res.status(200).json({
        ok: true,
        version: indexObj.version,
        createdAt: indexObj.createdAt,
        updatedAt: indexObj.updatedAt,
        commitCount: Object.keys(indexObj.commits || {}).length,
        nonceCount: Object.keys(indexObj.nonces || {}).length
    });
});

// ─────────────────────────────────────────────
// POST /api/dao/commit  (mounted at /api/dao)
// Path here is "/commit"
// ─────────────────────────────────────────────
router.post("/commit", (req, res) => {
    let indexObj;

    try {
        indexObj = loadIndex();
    } catch (e) {
        return res.status(500).json({
            ok: false,
            error: "DAO_INDEX_LOAD_FAILED",
            detail: e.message
        });
    }

    const envelope = req.body || {};

    // 1) Structural validation
    if (
        !envelope ||
        typeof envelope !== "object" ||
        !envelope.type ||
        !envelope.version ||
        !envelope.ts ||
        !envelope.nonce ||
        !envelope.idempotencyKey ||
        !envelope.payload ||
        !envelope.signature
    ) {
        return res.status(400).json({
            ok: false,
            error: "INVALID_COMMIT_ENVELOPE"
        });
    }

    // Enforce expected type for this phase
    if (envelope.type !== "DAO_COMMIT_REQUESTED") {
        return res.status(400).json({
            ok: false,
            error: "UNSUPPORTED_ENVELOPE_TYPE",
            type: envelope.type
        });
    }

    // 2) Replay protection (idempotencyKey)
    if (indexObj.commits && indexObj.commits[envelope.idempotencyKey]) {
        return res.status(409).json({
            ok: false,
            error: "REPLAY_DETECTED",
            idempotencyKey: envelope.idempotencyKey,
            prior: indexObj.commits[envelope.idempotencyKey]
        });
    }

    // 3) Replay protection (nonce)
    if (indexObj.nonces && indexObj.nonces[envelope.nonce]) {
        return res.status(409).json({
            ok: false,
            error: "NONCE_REPLAY_DETECTED",
            nonce: envelope.nonce,
            prior: indexObj.nonces[envelope.nonce]
        });
    }

    // 4) Signature verification (enforced)
    try {
        verifySignatureOrThrow(envelope);
    } catch (e) {
        const msg = e.message || "INVALID_SIGNATURE";
        const code =
            msg === "INVALID_SIGNATURE" ? 401 :
                msg === "MISSING_DAO_COMMIT_PUB_PEM" ? 500 :
                    msg === "DAO_COMMIT_PUB_PEM_NOT_FOUND" ? 500 :
                        500;

        return res.status(code).json({
            ok: false,
            error: msg
        });
    }

    // 5) Compute authoritative commit hash (over unsigned canonical envelope)
    const unsigned = {
        type: envelope.type,
        version: envelope.version,
        ts: envelope.ts,
        nonce: envelope.nonce,
        idempotencyKey: envelope.idempotencyKey,
        payload: envelope.payload
    };

    const canonical = stableStringify(unsigned);
    const commitHash = sha256Hex(canonical);

    // 6) Persist commit to ledger file
    const safeIdem = String(envelope.idempotencyKey).replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `commit-${Date.now()}-${safeIdem}.json`;
    const filePath = path.join(ledgerDir, filename);

    const record = {
        ...unsigned,
        signature: envelope.signature,
        commitHash,
        receivedAt: new Date().toISOString()
    };

    try {
        fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
    } catch (e) {
        return res.status(500).json({
            ok: false,
            error: "LEDGER_WRITE_FAILED",
            detail: e.message
        });
    }

    // 7) Update index (idempotencyKey + nonce)
    indexObj.commits[envelope.idempotencyKey] = {
        ts: envelope.ts,
        nonce: envelope.nonce,
        hash: commitHash,
        file: filePath
    };

    indexObj.nonces[envelope.nonce] = {
        ts: envelope.ts,
        idempotencyKey: envelope.idempotencyKey,
        hash: commitHash,
        file: filePath
    };

    try {
        saveIndex(indexObj);
    } catch (e) {
        return res.status(500).json({
            ok: false,
            error: "DAO_INDEX_SAVE_FAILED",
            detail: e.message
        });
    }

    // 8) Success response
    return res.status(200).json({
        ok: true,
        committed: true,
        idempotencyKey: envelope.idempotencyKey,
        nonce: envelope.nonce,
        commitHash,
        ledgerFile: filePath,
        ts: new Date().toISOString()
    });
});

module.exports = router;
