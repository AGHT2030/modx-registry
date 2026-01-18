/**
 * A6.3 — Trustee Decision Check
 * Reads immutable trustee decisions from AGVault.
 */

const fs = require("fs");
const path = require("path");

const VAULT_ROOT = process.env.AGH_VAULT || "/mnt/c/Users/mialo/AGVault";

const DECISION_DIR = path.resolve(VAULT_ROOT, "trustee/decisions");
const ESCALATION_DIR = path.resolve(VAULT_ROOT, "trustee/escalations");

function getEscalationPath(escalationId) {
  return path.join(ESCALATION_DIR, `${escalationId}.json`);
}

function getDecisionPath(escalationId, decision) {
  return path.join(DECISION_DIR, `${escalationId}-${decision}.json`);
}

function loadEscalation(escalationId) {
  const p = getEscalationPath(escalationId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadDecision(escalationId) {
  // Prefer APPROVE if present, else REJECT if present
  const approvePath = getDecisionPath(escalationId, "APPROVE");
  const rejectPath = getDecisionPath(escalationId, "REJECT");

  if (fs.existsSync(approvePath)) {
    return JSON.parse(fs.readFileSync(approvePath, "utf8"));
  }
  if (fs.existsSync(rejectPath)) {
    return JSON.parse(fs.readFileSync(rejectPath, "utf8"));
  }
  return null;
}

function assertApproved(escalationId) {
  const escalation = loadEscalation(escalationId);
  if (!escalation) {
    return { ok: false, status: 404, error: "ESCALATION_NOT_FOUND" };
  }

  const decision = loadDecision(escalationId);
  if (!decision) {
    return { ok: false, status: 409, error: "TRUSTEE_DECISION_PENDING" };
  }

  if (decision.decision !== "APPROVE") {
    return { ok: false, status: 403, error: "TRUSTEE_REJECTED" };
  }

  // Bind decision to escalation hash to prevent mismatch/replay
  if (decision.escalationHash !== escalation.hash) {
    return { ok: false, status: 409, error: "DECISION_HASH_MISMATCH" };
  }

  return { ok: true, escalation, decision };
}

module.exports = {
  loadEscalation,
  loadDecision,
  assertApproved
};
