/**
 * A6.3 — Trustee Escalation Queue
 * Immutable escalation request writer
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const QUEUE_DIR = path.resolve(
  process.env.AGH_VAULT || "/mnt/c/Users/mialo/AGVault",
  "trustee/escalations"
);

if (!fs.existsSync(QUEUE_DIR)) {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

function hashEscalation(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function queueTrusteeEscalation({ project, governance }) {
  const timestamp = Date.now();

  const record = {
    type: "TRUSTEE_ESCALATION",
    projectId: project.projectId,
    payload: project,
    governance,
    timestamp
  };

  const hash = hashEscalation(record);
  const id = `ESC-${timestamp}-${hash.slice(0, 12)}`;

  const filePath = path.join(QUEUE_DIR, `${id}.json`);

  fs.writeFileSync(
    filePath,
    JSON.stringify({ id, hash, ...record }, null, 2)
  );

  return {
    id,
    hash,
    filePath
  };
}

module.exports = {
  queueTrusteeEscalation
};
