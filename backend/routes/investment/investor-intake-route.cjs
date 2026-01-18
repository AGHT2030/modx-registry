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
    const mod = require("../../mode/middleware/requireModlinkProof.cjs");
    return mod.requireModlinkProof || mod;
}

// --------------------------------------------------
// LAZY LOAD AUTHORITATIVE INTAKE HANDLER
// --------------------------------------------------
function loadIntakeHandler() {
    const intakeRouter = require("./intake-route.cjs");

    const layer = intakeRouter.stack.find(
        (l) => l.route && l.route.path === "/intake"
    );

    if (!layer) {
        throw new Error("Authoritative intake handler not found");
    }

    return layer.route.stack[0].handle;
}

// --------------------------------------------------
// GOVERNED INVEST INTAKE (MODE → INVEST)
// --------------------------------------------------
router.post(
    "/intake",

    // 🔒 FIRST BYTE GOVERNANCE
    denyIfMissingModlinkProof,

    // 🔐 MODLINK VERIFICATION (LAZY)
    (req, res, next) => {
        const requireModlinkProof = loadRequireModlinkProof();
        return requireModlinkProof("INVEST_INTAKE")(req, res, next);
    },

    // 🚀 AUTHORITATIVE INTAKE EXECUTION
    (req, res, next) => {
        const handler = loadIntakeHandler();
        return handler(req, res, next);
    }
);

module.exports = router;
