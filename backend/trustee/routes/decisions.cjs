/**
 * A6.3 — Trustee Decision Route
 * Approve / Reject Escalations
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const ESCALATION_DIR = path.resolve(
  process.env.AGH_VAULT || "/mnt/c/Users/mialo/AGVault",
  "trustee/escalations"
);

const DECISION_DIR = path.resolve(
  process.env.AGH_VAULT || "/mnt/c/Users/mialo/AGVault",
  "trustee/decisions"
);

if (!fs.existsSync(DECISION_DIR)) {
  fs.mkdirSync(DECISION_DIR, { recursive: true });
}

function signDecision(data) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

router.post("/trustee/decision", (req, res) => {
  try {
    const { escalationId, decision, trusteeId } = req.body;

    if (!escalationId || !decision || !trusteeId) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const escalationPath = path.join(ESCALATION_DIR, `${escalationId}.json`);
    if (!fs.existsSync(escalationPath)) {
      return res.status(404).json({ error: "ESCALATION_NOT_FOUND" });
    }

    const escalation = JSON.parse(fs.readFileSync(escalationPath));

    const decisionRecord = {
      escalationId,
      decision, // APPROVE | REJECT
      trusteeId,
      escalationHash: escalation.hash,
      timestamp: new Date().toISOString()
    };

    const signature = signDecision(decisionRecord);

    const decisionPath = path.join(
      DECISION_DIR,
      `${escalationId}-${decision}.json`
    );

    fs.writeFileSync(
      decisionPath,
      JSON.stringify({ signature, ...decisionRecord }, null, 2)
    );

    return res.json({
      ok: true,
      escalationId,
      decision,
      signature
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
