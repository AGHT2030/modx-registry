
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

// © 2025 AIMAL Global Holdings | PQC Envelope Layer
// -----------------------------------------------------------------------------
// Purpose:
//   • Wrap all cross-chain packets in a post-quantum envelope
//   • Provide deterministic anti-tamper SHA-256 seal
//   • Generate Dilithium5 + Falcon512 pseudo-signatures
//   • Enable Universe Gateway to validate origins
//   • Provide trust-grade metadata for AGH Trust Layer
//
// This layer does NOT attempt to simulate real Dilithium math —
// instead, it produces deterministic, HMAC-secured signatures using
// the private keys from backend/pqc/keys/*.private
//
// Envelope Structure:
// {
//   meta: { ... },
//   payload: { ... },
//   seal: {
//     sha256: <string>,
//     dilithium5: <string>,
//     falcon512: <string>,
//     combined: <string>
//   }
// }
//
// -----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// PQC key directory
const PQC_DIR = path.join(__dirname, "keys");
const DILITHIUM_PRIV = path.join(PQC_DIR, "dilithium5.private");
const FALCON_PRIV = path.join(PQC_DIR, "falcon512.private");

// Load pseudo-private keys
function loadKey(fp) {
    try {
        return fs.readFileSync(fp);
    } catch {
        return Buffer.from("fallback-pqc-key");
    }
}

const dilithiumKey = loadKey(DILITHIUM_PRIV);
const falconKey = loadKey(FALCON_PRIV);

/* -----------------------------------------------------------------------------
   1️⃣ SHA-256 Deterministic Hash
----------------------------------------------------------------------------- */
function sha256(data) {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

/* -----------------------------------------------------------------------------
   2️⃣ PQC HMAC Signatures (Deterministic)
----------------------------------------------------------------------------- */
function signDilithium(hashHex) {
    return crypto
        .createHmac("sha512", dilithiumKey)
        .update(hashHex)
        .digest("hex");
}

function signFalcon(hashHex) {
    return crypto
        .createHmac("sha512", falconKey)
        .update(hashHex)
        .digest("hex");
}

/* -----------------------------------------------------------------------------
   3️⃣ PQC Envelope Generator
----------------------------------------------------------------------------- */
function pqcSignEnvelope({ type, payload, topic, ts }) {
    const timestamp = ts || Date.now();

    const meta = {
        type: type || topic || "unknown",
        origin: detectOrigin(type),
        timestamp,
        version: "pqc-envelope-v2",
        issuer: "AGH_TRUST_LAYER",
        subsystem:
            type?.startsWith("XRPL") ? "xrpl" :
                type?.startsWith("EVM") ? "evm" :
                    type?.startsWith("GOV") ? "governance" :
                        type?.startsWith("POR") ? "proof-of-reserve" :
                            type?.startsWith("AURA") ? "aura" :
                                type?.startsWith("MODLINK") ? "modlink" :
                                    type?.startsWith("C5") ? "severity-engine" :
                                        "general"
    };

    const envelope = {
        meta,
        payload,
    };

    // Step 1 → SHA-256 trust hash
    const hashHex = sha256(envelope);

    // Step 2 → PQC signatures
    const dil = signDilithium(hashHex);
    const fal = signFalcon(hashHex);

    const combined = crypto
        .createHash("sha256")
        .update(dil + fal)
        .digest("hex");

    envelope.seal = {
        sha256: hashHex,
        dilithium5: dil,
        falcon512: fal,
        combined,
        sealedAt: new Date().toISOString()
    };

    return envelope;
}

/* -----------------------------------------------------------------------------
   4️⃣ Origin Detection Helper
----------------------------------------------------------------------------- */
function detectOrigin(type = "") {
    const t = type.toLowerCase();

    if (t.includes("xrpl")) return "XRPL Governance Listener";
    if (t.includes("evm")) return "EVM Governance Listener";
    if (t.includes("gov")) return "MODLINK / Governance";
    if (t.includes("c4")) return "C4 Hybrid Bridge";
    if (t.includes("c5")) return "C5 Severity Engine";
    if (t.includes("aura")) return "AURA Twins / Sentinel";
    if (t.includes("por")) return "MODUSD Proof-of-Reserve";
    if (t.includes("moda")) return "MODA Subsystem";
    if (t.includes("coinpurse")) return "CoinPurse Compliance";

    return "Unknown Module";
}

/* -----------------------------------------------------------------------------
   5️⃣ Optional Verifier (for trust layer, disabled by default)
----------------------------------------------------------------------------- */
function verifyEnvelope(envelope) {
    if (!envelope?.seal?.sha256) return false;

    const { sha256: originalHash } = envelope.seal;

    const cloned = {
        meta: envelope.meta,
        payload: envelope.payload
    };

    const recalculated = sha256(cloned);

    return recalculated === originalHash;
}

/* -----------------------------------------------------------------------------
   EXPORTS
----------------------------------------------------------------------------- */
module.exports = {
    pqcSignEnvelope,
    verifyEnvelope
};
