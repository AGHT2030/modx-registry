/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * POA Revocation Store — Authoritative Kill Switch
 *
 * File-backed, AGVault-compatible
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_PATH = path.resolve(
  process.env.POA_REVOCATION_PATH ||
    "C:/Users/mialo/AGVault/poa/poa_revocations.json"
);

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadStore(filePath = DEFAULT_PATH) {
  try {
    if (!fs.existsSync(filePath)) {
      return { version: 1, updated_at: null, revoked: [] };
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    if (!json || !Array.isArray(json.revoked)) {
      return { version: 1, updated_at: null, revoked: [] };
    }
    return json;
  } catch {
    return { version: 1, updated_at: null, revoked: [] };
  }
}

function saveStore(store, filePath = DEFAULT_PATH) {
  ensureDir(filePath);
  const out = {
    version: store.version || 1,
    updated_at: new Date().toISOString(),
    revoked: store.revoked || [],
  };
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
  return filePath;
}

function revoke({ poa_id, nonce, reason, actor }, filePath = DEFAULT_PATH) {
  if (!poa_id && !nonce) {
    throw new Error("Provide poa_id and/or nonce to revoke");
  }

  const store = loadStore(filePath);

  const entry = {
    poa_id: poa_id || null,
    nonce: nonce || null,
    reason: reason || "unspecified",
    actor: actor || "unknown",
    revoked_at: new Date().toISOString(),
  };

  const exists = store.revoked.some(
    (r) =>
      (poa_id && r.poa_id === poa_id) ||
      (nonce && r.nonce === nonce)
  );

  if (!exists) {
    store.revoked.push(entry);
  }

  saveStore(store, filePath);
  return entry;
}

function isRevoked({ poa_id, nonce }, filePath = DEFAULT_PATH) {
  const store = loadStore(filePath);
  return store.revoked.some(
    (r) =>
      (poa_id && r.poa_id === poa_id) ||
      (nonce && r.nonce === nonce)
  );
}

function listRevocations(filePath = DEFAULT_PATH) {
  return loadStore(filePath).revoked;
}

module.exports = {
  DEFAULT_PATH,
  loadStore,
  saveStore,
  revoke,
  isRevoked,
  listRevocations,
};
