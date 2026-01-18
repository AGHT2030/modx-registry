"use strict";

/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * DAO Ledger Writer — Append-only
 */

const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function dayKey(d = new Date()) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function appendLedgerEntry({ ledgerDir, entry }) {
  if (!ledgerDir) throw new Error("LEDGER_DIR_REQUIRED");
  ensureDir(ledgerDir);

  const file = path.join(ledgerDir, `ledger-${dayKey()}.jsonl`);
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(file, line, "utf8");

  return { ledgerFile: file };
}

module.exports = { appendLedgerEntry };
