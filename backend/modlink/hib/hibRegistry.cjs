/**
 * © 2025–2026 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * HIB Registry (append-only)
 * - Stores sealed HIB payloads (post MODLINK proof)
 * - Emits immutable audit ledger entries (index.jsonl)
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REGISTRY_DIR =
  process.env.HIB_REGISTRY_DIR ||
  path.resolve(__dirname, "./registry");

const INDEX_PATH =
  process.env.HIB_INDEX_PATH ||
  path.join(REGISTRY_DIR, "index.jsonl");

function ensureDir() {
  if (!fs.existsSync(REGISTRY_DIR)) fs.mkdirSync(REGISTRY_DIR, { recursive: true });
}

function stableStringify(obj) {
  // deterministic-ish stringify for hashing (good enough for internal audit)
  // If you later want full canonicalization, we can upgrade this.
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizeHibId(hibId) {
  // allow: letters, numbers, dash, underscore, dot
  const safe = String(hibId || "").trim();
  if (!safe) return null;
  if (!/^[a-zA-Z0-9._-]{6,128}$/.test(safe)) return null;
  return safe;
}

function makeDefaultHibId() {
  // HIB-YYYYMMDD-HHMMSS-<8hex>
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp =
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-` +
    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  const rand = crypto.randomBytes(4).toString("hex");
  return `HIB-${stamp}-${rand}`;
}

function filePathFor(hibId) {
  return path.join(REGISTRY_DIR, `${hibId}.json`);
}

function appendIndex(entry) {
  ensureDir();
  fs.appendFileSync(INDEX_PATH, `${JSON.stringify(entry)}\n`);
}

function exists(hibId) {
  ensureDir();
  return fs.existsSync(filePathFor(hibId));
}

function read(hibId) {
  ensureDir();
  const fp = filePathFor(hibId);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

/**
 * Seal + persist a HIB payload (after governance proof is confirmed)
 * @returns {object} sealed record
 */
function seal({
  hib_id,
  origin,
  target,
  scope,
  trustee_id,
  modlink_proof_id,
  correlation_id,
  timelock_seconds,
  payload
}) {
  ensureDir();

  let hid = sanitizeHibId(hib_id) || makeDefaultHibId();

  // If collision, suffix
  if (exists(hid)) hid = `${hid}-${crypto.randomBytes(2).toString("hex")}`;

  const payloadStr = stableStringify(payload || {});
  const payload_hash = sha256Hex(payloadStr);

  const sealed = {
    hib_id: hid,
    status: "SEALED",
    origin: origin || null,
    target: target || null,
    scope: scope || null,
    trustee_id: trustee_id || null,
    modlink_proof_id: modlink_proof_id || null,
    correlation_id: correlation_id || null,
    timelock_seconds: Number.isFinite(Number(timelock_seconds)) ? Number(timelock_seconds) : 0,
    payload_hash,
    created_at: nowIso(),
    payload: payload || {}
  };

  // Write record (single source of truth)
  fs.writeFileSync(filePathFor(hid), JSON.stringify(sealed, null, 2));

  // Append immutable ledger line
  appendIndex({
    type: "HIB_SEALED",
    hib_id: hid,
    payload_hash,
    origin: sealed.origin,
    target: sealed.target,
    scope: sealed.scope,
    trustee_id: sealed.trustee_id,
    modlink_proof_id: sealed.modlink_proof_id,
    correlation_id: sealed.correlation_id,
    timelock_seconds: sealed.timelock_seconds,
    at: sealed.created_at
  });

  return sealed;
}

module.exports = {
  seal,
  read,
  exists
};
