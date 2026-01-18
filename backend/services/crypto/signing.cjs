"use strict";

const crypto = require("crypto");

function stableStringify(obj) {
  // deterministic JSON for signing
  const allKeys = [];
  JSON.stringify(obj, (k, v) => (allKeys.push(k), v));
  allKeys.sort();
  return JSON.stringify(obj, allKeys);
}

function canonicalCommitString(envelope) {
  // Only sign stable fields (no volatile fields beyond ts/nonce)
  const core = {
    type: envelope.type,
    version: envelope.version,
    ts: envelope.ts,
    nonce: envelope.nonce,
    idempotencyKey: envelope.idempotencyKey,
    payload: envelope.payload
  };
  return stableStringify(core);
}

function signEnvelope(envelope, privateKeyPem) {
  const msg = canonicalCommitString(envelope);
  const sig = crypto.sign(null, Buffer.from(msg, "utf8"), privateKeyPem);
  return sig.toString("base64");
}

function verifyEnvelope(envelope, signatureB64, publicKeyPem) {
  const msg = canonicalCommitString(envelope);
  const sig = Buffer.from(signatureB64, "base64");
  return crypto.verify(null, Buffer.from(msg, "utf8"), publicKeyPem, sig);
}

function newNonce() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = {
  canonicalCommitString,
  signEnvelope,
  verifyEnvelope,
  newNonce
};
