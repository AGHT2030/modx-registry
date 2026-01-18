"use strict";

/**
 * CJS-safe MODLINK governance gate
 * - DEMO mode bypass (NO verifier load)
 * - Production mode lazy-loads verifier ONLY
 */

const DENY_REASONS = {
    MISSING_PROOF: "DENY_MISSING_MODLINK_PROOF",
    MALFORMED_PROOF: "DENY_MALFORMED_MODLINK_PROOF",
    INVALID_PROOF: "DENY_INVALID_MODLINK_PROOF",
    ACTION_MISMATCH: "DENY_ACTION_MISMATCH"
};

function deny(res, reason) {
    return res.status(403).json({
        error: "GOVERNANCE_DENIED",
        reason
    });
}

function requireModlinkProof(action) {

    // --------------------------------------------------
    // 🧪 DEMO / PRE-ACTIVATION MODE (NO ESM LOAD EVER)
    // --------------------------------------------------
    if (process.env.MODLINK_DEMO_MODE === "true") {
        return (req, res, next) => {
            if (!req.headers["x-modlink-proof"]) {
                return deny(res, DENY_REASONS.MISSING_PROOF);
            }

            req.governance = Object.freeze({
                correlationId: `DEMO-${Date.now()}`,
                action,
                resource: req.originalUrl,
                issuedAt: Date.now(),
                expiresAt: null,
                mode: "DEMO_BYPASS",
                verified: false
            });

            return next();
        };
    }

    // --------------------------------------------------
    // 🔐 PRODUCTION MODE (LAZY LOAD VERIFIER ONLY)
    // --------------------------------------------------
    return async (req, res, next) => {
        const proof = req.headers["x-modlink-proof"];
        if (!proof) {
            return deny(res, DENY_REASONS.MISSING_PROOF);
        }

        let verifyModlinkProof;
        try {
            // ⚠️ IMPORTANT:
            // We load the verifier directly — NOT the ESM middleware
            const mod = await import("../security/verifyModlinkProof.js");
            verifyModlinkProof = mod.verifyModlinkProof;
        } catch (err) {
            console.error("❌ MODLINK verifier load failed:", err);
            return res.status(500).json({
                error: "GOVERNANCE_INTERNAL_ERROR",
                reason: "MODLINK_VERIFIER_LOAD_FAILED"
            });
        }

        let result;
        try {
            result = verifyModlinkProof(proof, {
                action,
                resource: req.originalUrl
            });
        } catch {
            return deny(res, DENY_REASONS.MALFORMED_PROOF);
        }

        if (!result || result.valid !== true) {
            return deny(res, result?.reason || DENY_REASONS.INVALID_PROOF);
        }

        if (result.context?.action !== action) {
            return deny(res, DENY_REASONS.ACTION_MISMATCH);
        }

        req.governance = Object.freeze(result.context);
        next();
    };
}

module.exports = { requireModlinkProof };
