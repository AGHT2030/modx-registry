
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
 * © 2025 Mia Lopez | MODAStay™ Enterprise Franchise Admin
 * ENTERPRISE COMPLIANCE ROUTER (Full Security Tier)
 *
 * Includes:
 * - RSA Signature Audits
 * - Anti-Replay Events
 * - Device Trust Logs
 * - Contract Sync State
 * - Sentinel / Policy Engine Hits
 * - MODE Event Coordinator Logs
 * - GeoFence Violations
 * - Full Text Search Index
 * - Pagination Safety + Hard Limits
 * - License + Property Signature Enforcement
 */

const express = require("express");
const router = express.Router();
const ComplianceLog = require("../../models/ComplianceLog");
const {
    verifyLicenseKey,
    verifyPropertySignature
} = require("../../middleware/security/franchiseSecurity");
const { checkHealthAndAlert } = require("../../middleware/alertHooks");

// ================================================================
// 0️⃣ ENTERPRISE EVENT TYPE REGISTRY
// ================================================================
const VALID_TYPES = new Set([
    // RSA
    "rsa:valid",
    "rsa:invalid",
    "rsa:expired",
    "rsa:rotation",
    "rsa:fingerprint-mismatch",

    // Anti-Replay
    "replay:nonce-reused",
    "replay:nonce-old",
    "replay:blocked",

    // Device Trust
    "device:registered",
    "device:banned",
    "device:unbanned",
    "device:fingerprint-rotated",

    // Contract Sync
    "contractSync:proposal",
    "contractSync:applied",
    "contractSync:failed",
    "contractSync:listener-active",

    // Sentinel & Policy Engine
    "sentinel:rule-hit",
    "sentinel:violation",
    "sentinel:override",
    "policy:violation",
    "policy:approved",

    // MODE Event Coordinator
    "mode:event-created",
    "mode:event-updated",
    "mode:event-deleted",
    "mode:event-auto-approved",
    "mode:event-rejected",

    // GeoFence
    "geoFence:entered",
    "geoFence:blocked",
    "geoFence:bypass-attempt",
    "geoFence:admin-update",

    // System
    "system:info",
    "system:warning",
    "system:error",
    "system:critical"
]);

// ================================================================
// HEALTH CHECK
// ================================================================
router.get("/health", (req, res) => {
    res.json({
        ok: true,
        service: "Enterprise Franchise Compliance Logs",
        timestamp: new Date().toISOString()
    });
});

// ================================================================
// GLOBAL SECURITY ENFORCEMENT
// ================================================================
router.use(verifyLicenseKey);
router.use(verifyPropertySignature);

// ================================================================
// PAGINATED LOG FETCH (with safety limits)
// ================================================================
router.get("/list", async (req, res) => {
    try {
        let {
            page = 1,
            limit = 20,
            type,
            propertyId,
            severity,
            deviceId,
            search
        } = req.query;

        // Safety enforcement
        limit = Math.min(Number(limit), 100);

        const query = {};

        if (type) query.type = type;
        if (propertyId) query.propertyId = propertyId;
        if (severity) query.severity = severity;
        if (deviceId) query.deviceId = deviceId;

        if (search) query.$text = { $search: search };

        const logs = await ComplianceLog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ComplianceLog.countDocuments(query);

        res.json({
            ok: true,
            page: Number(page),
            pages: Math.ceil(total / limit),
            limit,
            total,
            data: logs
        });

    } catch (err) {
        console.error("❌ Compliance list error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================================================================
// GET SINGLE LOG
// ================================================================
router.get("/log/:id", async (req, res) => {
    try {
        const log = await ComplianceLog.findById(req.params.id);
        if (!log) return res.status(404).json({ ok: false, error: "Log not found" });

        res.json({ ok: true, log });

    } catch (err) {
        console.error("❌ Compliance fetch error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================================================================
// ADD LOG (Internal Systems Only)
// ================================================================
router.post("/add", async (req, res) => {
    try {
        const { type, severity, message, propertyId, deviceId, metadata } = req.body;

        // Normalize + enforce type
        const normalizedType = VALID_TYPES.has(type) ? type : "system:info";

        const entry = new ComplianceLog({
            type: normalizedType,
            severity: severity || "info",
            propertyId,
            message,
            deviceId,
            metadata: metadata || {}
        });

        await entry.save();

        // Critical alerts → Slack, Email, PM2
        if (severity === "critical" || normalizedType.includes("violation")) {
            checkHealthAndAlert("Enterprise Compliance", false, message);
        }

        res.json({ ok: true, entry });

    } catch (err) {
        console.error("❌ Compliance create error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================================================================
// DELETE ENTRY
// ================================================================
router.delete("/log/:id", async (req, res) => {
    try {
        await ComplianceLog.findByIdAndDelete(req.params.id);
        res.json({ ok: true, deleted: req.params.id });

    } catch (err) {
        console.error("❌ Compliance delete error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================================================================
// PURGE (Super Admin only)
// ================================================================
router.delete("/purge", async (req, res) => {
    try {
        if (req.headers["x-modastay-superadmin"] !== process.env.SUPERADMIN_SECRET) {
            return res.status(403).json({
                ok: false,
                error: "Superadmin secret required for purge."
            });
        }

        await ComplianceLog.deleteMany({});
        res.json({ ok: true, message: "All compliance logs purged." });

    } catch (err) {
        console.error("❌ purge error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================================================================
module.exports = router;
