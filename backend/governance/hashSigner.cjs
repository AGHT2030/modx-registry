/**
 * A6.2.1 — Governance Hash Signer
 * Canonical SHA-256 signing
 */

const crypto = require("crypto");

function signGovernancePayload(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

module.exports = {
  signGovernancePayload
};
