/**
 * © 2025 AIMAL Global Holdings | Compliance Inbox Router
 * Harmonizes SIT identity with compliance actions:
 *  - KYC/AML checks
 *  - Investor clearance checks
 *  - Transaction reviews
 *  - Governance permission checks
 *  - ETF whitelist/blacklist rules
 *  - AIRS + AURA security evaluations
 */

const express = require("express");
const router = express.Router();

const { validateIdentityForAction } = require("./sitComplianceBinder");

// -----------------------------------------------------------
// POST /compliance/evaluate
// Evaluates any action for SIT-bound compliance approval
// -----------------------------------------------------------
router.post("/compliance/evaluate", async (req, res) => {
    const { wallet, action } = req.body;

    if (!wallet || !action) {
        return res.status(400).json({
            status: "ERROR",
            reason: "Missing wallet or action payload"
        });
    }

    const evaluation = await validateIdentityForAction(wallet, action);

    if (!evaluation.allowed) {
        return res.status(403).json({
            status: "DENIED",
            reason: evaluation.reason
        });
    }

    return res.json({
        status: "APPROVED",
        identity: evaluation
    });
});

// -----------------------------------------------------------
// Simple health check
// -----------------------------------------------------------
router.get("/compliance/health", (req, res) => {
    res.json({ status: "ok", service: "Compliance Inbox Active" });
});

module.exports = router;
