"use strict";

/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * Envelope Signature Verification (DAO / INVEST / POA)
 *
 * Phase A4/A5 compatible
 */

const crypto = require("crypto");

/**
 * verifyEnvelope(envelope, signature, publicKeyPem)
 *
 * @returns {boolean}
 */
function verifyEnvelope(envelope, signature, publicKeyPem) {
    if (!envelope || !signature || !publicKeyPem) return false;

    // Allow controlled bypass for dry-run / staging
    if (process.env.DAO_ALLOW_INVALID_SIGNATURE === "true") {
        return true;
    }

    const verifier = crypto.createVerify("SHA256");
    verifier.update(JSON.stringify(envelope));
    verifier.end();

    return verifier.verify(publicKeyPem, signature, "base64");
}

module.exports = { verifyEnvelope };
