"use strict";

const express = require("express");

// ------------------------------------------------------------------
// SAFE CONSTANTS (CJS ONLY — NO ESM IMPORTS HERE)
// ------------------------------------------------------------------
const DENY_REASONS = Object.freeze({
    DENY_MISSING_MODLINK_PROOF: "DENY_MISSING_MODLINK_PROOF",
    DENY_POLICY: "DENY_POLICY"
});

// ------------------------------------------------------------------
// ROUTER
// ------------------------------------------------------------------
const router = express.Router();

// ------------------------------------------------------------------
// IN-MEMORY STATE (AUDIT FRIENDLY)
// ------------------------------------------------------------------
const activeProposals = {};
const proposalHistory = {};

// ------------------------------------------------------------------
// HARD PRE-GUARD (ABSOLUTE)
// This MUST run before ANY MODLINK code is touched
// ------------------------------------------------------------------
function denyIfMissingModlinkProof(req, res, next) {
    const proof = req.headers["x-modlink-proof"];
    if (!proof) {
        return res.status(403).json({
            error: "GOVERNANCE_DENIED",
            reason: DENY_REASONS.DENY_MISSING_MODLINK_PROOF
        });
    }
    next();
}

// ------------------------------------------------------------------
// LAZY MODLINK LOADER (CRITICAL)
// Nothing governance-related is loaded until AFTER header check
// ------------------------------------------------------------------
function loadRequireModlinkProof() {
    // CJS ONLY — this file must NOT import ESM at top level
    const mod = require("../mode/middleware/requireModlinkProof.cjs");
    return mod.requireModlinkProof || mod;
}

// ------------------------------------------------------------------
// HELPERS (EXPORTED FOR TESTING)
// ------------------------------------------------------------------
function getTimelockSeconds(proposal) {
    return Number(proposal.timelockSeconds || 0);
}

// ------------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------------

// Create proposal
router.post(
    "/proposal",
    denyIfMissingModlinkProof,
    (req, res, next) => {
        const requireModlinkProof = loadRequireModlinkProof();
        return requireModlinkProof("GOV_PROPOSAL_CREATE")(req, res, next);
    },
    (req, res) => {
        const { id, action, params } = req.body || {};
        if (!id || !action) {
            return res.status(400).json({ error: "INVALID_PROPOSAL" });
        }

        activeProposals[id] = {
            id,
            action,
            params,
            status: "PRE-FLIGHT",
            createdAt: Date.now(),
            timelockSeconds: 60
        };

        global.GOVBUS?.emit?.("proposal:preflight", activeProposals[id]);

        res.json({ status: "created", proposal: activeProposals[id] });
    }
);

// Execute proposal
router.post(
    "/proposal/:id/execute",
    denyIfMissingModlinkProof,
    (req, res, next) => {
        const requireModlinkProof = loadRequireModlinkProof();
        return requireModlinkProof("GOV_PROPOSAL_EXECUTE")(req, res, next);
    },
    (req, res) => {
        const proposal = activeProposals[req.params.id];
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }

        const t = getTimelockSeconds(proposal);
        const earliest = proposal.createdAt + t * 1000;

        if (t > 0 && Date.now() < earliest) {
            return res.status(403).json({
                error: "GOVERNANCE_DENIED",
                reason: DENY_REASONS.DENY_POLICY
            });
        }

        proposal.status = "EXECUTE";
        global.GOVBUS?.emit?.("proposal:execute", proposal);

        res.json({ status: "executing", proposal });
    }
);

// Archive proposal
router.post("/proposal/:id/archive", (req, res) => {
    const proposal = activeProposals[req.params.id];
    if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
    }

    proposal.status = "ARCHIVE";
    proposalHistory[proposal.id] = proposal;
    delete activeProposals[proposal.id];

    global.GOVBUS?.emit?.("proposal:archive", proposal);
    res.json({ status: "archived", proposal });
});

// ------------------------------------------------------------------
// TEST HOOKS (READ-ONLY)
// ------------------------------------------------------------------
router._test = {
    getTimelockSeconds,
    DENY_REASONS
};

module.exports = router;
