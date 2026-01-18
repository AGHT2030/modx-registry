"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Deterministic idempotency:
 * - Prefer Idempotency-Key header if provided
 * - Else hash stable fields
 */
function buildIdempotencyKey(req, payload) {
  const hdr = req.get("Idempotency-Key") || req.get("x-idempotency-key");
  if (hdr && String(hdr).trim().length >= 8) return String(hdr).trim();

  const stable = {
    xrpl_address: payload.xrpl_address || payload.xrplAddress || "",
    investor: payload.investor || "",
    project: payload.project || "",
    amount: payload.amount ?? null,
    source: payload.source || "unknown"
  };

  return sha256(JSON.stringify(stable));
}

/**
 * Replay protection index:
 * - index.json maps idempotencyKey => { ts, stagedFile }
 */
function loadIndex(indexPath) {
  if (!fs.existsSync(indexPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } catch {
    return {};
  }
}

function saveIndex(indexPath, indexObj) {
  fs.writeFileSync(indexPath, JSON.stringify(indexObj, null, 2));
}

/**
 * Stage to queue (append-only JSONL + per-item JSON)
 */
function stageIntake({ queueDir, payload, idempotencyKey }) {
  ensureDir(queueDir);

  const indexPath = path.join(queueDir, "index.json");
  const indexObj = loadIndex(indexPath);

  // Replay protection window (default 24h)
  const replayMs = Number(process.env.INTAKE_REPLAY_WINDOW_MS || 24 * 60 * 60 * 1000);
  const now = Date.now();

  const existing = indexObj[idempotencyKey];
  if (existing && (now - existing.ts) < replayMs) {
    return {
      duplicate: true,
      idempotencyKey,
      stagedFile: existing.stagedFile
    };
  }

  const envelope = {
    type: "DAO_COMMIT_REQUESTED",
    version: "1.0",
    ts: new Date(now).toISOString(),
    idempotencyKey,
    payload
  };

  const itemFile = path.join(queueDir, `staged-${now}-${idempotencyKey.slice(0, 12)}.json`);
  fs.writeFileSync(itemFile, JSON.stringify(envelope, null, 2));

  const jsonlPath = path.join(queueDir, "intake-staged.jsonl");
  fs.appendFileSync(jsonlPath, JSON.stringify(envelope) + "\n");

  indexObj[idempotencyKey] = { ts: now, stagedFile: itemFile };
  saveIndex(indexPath, indexObj);

  return {
    duplicate: false,
    idempotencyKey,
    stagedFile: itemFile
  };
}

module.exports = {
  buildIdempotencyKey,
  stageIntake
};
