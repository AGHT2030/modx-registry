/**
 * HIB auto-persistence middleware
 * - Assumes governance-first: requireModlinkProof ran and set req.governance
 * - Seals the HIB payload + records immutable audit entry
 */

"use strict";

const { seal } = require("./hibRegistry.cjs");

function hibPersist({ origin, target, scope, timelockSeconds = 0 } = {}) {
  return (req, res, next) => {
    try {
      // Governance must already be present (first-byte rule)
      const g = req.governance || null;
      if (!g) {
        return res.status(500).json({
          error: "GOVERNANCE_REQUIRED",
          reason: "HIB_PERSIST_REQUIRES_GOVERNANCE"
        });
      }

      const hib_id = (req.headers["x-hib-id"] || "").toString().trim();
      const trustee_id =
        (req.headers["x-trustee-id"] || g.sub || "").toString().trim() || null;

      const correlation_id =
        (req.headers["x-correlation-id"] || g.correlationId || "").toString().trim() || null;

      const modlink_proof_id =
        (req.headers["x-modlink-proof-id"] || "").toString().trim() || null;

      const sealed = seal({
        hib_id,
        origin: origin || g.origin || null,
        target: target || g.target || null,
        scope: scope || g.action || null,
        trustee_id,
        modlink_proof_id,
        correlation_id,
        timelock_seconds: timelockSeconds,
        payload: req.body || {}
      });

      req.hib = sealed;
      res.setHeader("X-HIB-ID", sealed.hib_id);
      res.setHeader("X-HIB-HASH", sealed.payload_hash);

      return next();
    } catch (err) {
      return res.status(500).json({
        error: "HIB_PERSIST_FAILED",
        message: err?.message || "unknown"
      });
    }
  };
}

module.exports = { hibPersist };
