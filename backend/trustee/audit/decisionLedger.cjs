/**
 * A6.3 — Trustee Decision Ledger
 * Read-only audit helper
 */

const fs = require("fs");
const path = require("path");

const DECISION_DIR = path.resolve(
  process.env.AGH_VAULT || "/mnt/c/Users/mialo/AGVault",
  "trustee/decisions"
);

function listDecisions() {
  if (!fs.existsSync(DECISION_DIR)) return [];

  return fs.readdirSync(DECISION_DIR).map(file => {
    const content = fs.readFileSync(
      path.join(DECISION_DIR, file),
      "utf8"
    );
    return JSON.parse(content);
  });
}

module.exports = {
  listDecisions
};
