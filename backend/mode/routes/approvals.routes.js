"use strict";

const express = require("express");
const router = express.Router();

// --------------------------------------------------
// HARD PRE-GUARD (NO MODLINK LOAD YET)
// --------------------------------------------------
function denyIfMissingModlinkProof(req, res, next) {
    if (!req.headers["x-modlink-proof"]) {
        return res.status(403).json({
            error: "GOVERNANCE_DENIED",
            reason: "DENY_MISSING_MODLINK_PROOF"
        });
    }
    next();
}

// --------------------------------------------------
// LAZY LOAD MODLINK MIDDLEWARE (CJS SAFE)
// --------------------------------------------------
function loadRequireModlinkProof() {
    const mod = require("../middleware/requireModlinkProof.cjs");
    return mod.requireModlinkProof || mod;
}

// --------------------------------------------------
// LAZY LOAD HIB PERSISTENCE (CJS SAFE)
// --------------------------------------------------
function loadHibPersist() {
    const mod = require("../../modlink/hib/hibPersist.middleware.cjs");
    return mod.hibPersist;
}

// --------------------------------------------------
// GOVERNED ACTION (MODE → INVEST APPROVAL)
// --------------------------------------------------
router.post(
    "/approve",

    // 🔒 FIRST BYTE: ABSOLUTE GOVERNANCE GATE
    denyIfMissingModlinkProof,

    // 🔐 MODLINK VERIFICATION (LAZY LOAD)
    (req, res, next) => {
        const requireModlinkProof = loadRequireModlinkProof();
        return requireModlinkProof("MODE_APPROVE")(req, res, next);
    },

    // 🌱 HIB AUTO-PERSIST (SEALED + AUDITED)
    (req, res, next) => {
        const hibPersist = loadHibPersist();
        return hibPersist({
            origin: "MODE",
            target: "INVEST",
            scope: "MODE_APPROVE",
            timelockSeconds: 60 // policy-enforced downstream
        })(req, res, next);
    },

    // --------------------------------------------------
    // PLACEHOLDER EXECUTION (GOVERNANCE READY)
    // --------------------------------------------------
    (req, res) => {
        res.json({
            status: "MODE_APPROVED",
            governance: req.governance,
            hib: {
                hib_id: req.hib?.hib_id,
                payload_hash: req.hib?.payload_hash
            }
        });
    }
);

module.exports = router;
