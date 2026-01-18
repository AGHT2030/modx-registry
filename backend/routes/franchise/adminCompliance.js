
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

/**
 * © 2025 Mia Lopez | Franchise Compliance Routes
 */

const express = require("express");
const router = express.Router();
const ComplianceLog = require("../../models/ComplianceLog");
const { verifyLicense } = require("../../middleware/franchise/verifyLicense");
const { verifySignature } = require("../../middleware/franchise/verifySignature");

// All compliance APIs require license + signature
router.use(verifyLicense);
router.use(verifySignature);

/**
 * GET all logs (admin view)
 */
router.get("/", async (req, res) => {
    try {
        const logs = await ComplianceLog.find().sort({ createdAt: -1 }).limit(500);
        res.json({ ok: true, logs });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * GET logs for a specific property
 */
router.get("/:propertyId", async (req, res) => {
    try {
        const logs = await ComplianceLog.find({
            propertyId: req.params.propertyId
        })
            .sort({ createdAt: -1 })
            .limit(300);

        res.json({ ok: true, logs });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * Create a manual compliance event
 */
router.post("/record", async (req, res) => {
    const { propertyId, eventType, message, metadata, severity } = req.body;

    try {
        const log = await ComplianceLog.create({
            propertyId,
            eventType,
            message,
            metadata,
            severity
        });

        res.json({ ok: true, log });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
