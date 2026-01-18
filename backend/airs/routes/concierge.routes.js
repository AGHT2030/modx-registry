"use strict";

const express = require("express");
const router = express.Router();

// --------------------------------------------------
// HARD PRE-GUARD
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
// LAZY MODLINK LOADER
// --------------------------------------------------
function loadRequireModlinkProof() {
    const mod = require("../middleware/requireModlinkProof.cjs");
    return mod.requireModlinkProof || mod;
}

// --------------------------------------------------
// ALL AIRS ACTIONS ARE GOVERNED
// --------------------------------------------------
router.post(
    "/request",
    denyIfMissingModlinkProof,
    (req, res, next) => {
        const requireModlinkProof = loadRequireModlinkProof();
        return requireModlinkProof("AIRS_REQUEST")(req, res, next);
    },
    (_req, res) => {
        res.status(501).json({
            status: "GOVERNANCE_READY",
            message: "AIRS execution pending activation"
        });
    }
);

module.exports = router;
