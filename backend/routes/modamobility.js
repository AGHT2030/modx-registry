
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

// routes/modamobility.js
// © 2025 Mia Lopez | MODA Mobility Student & Creator Program API (Secured w/ MFA, Token, Logger)

const express = require("express");
const router = express.Router();
const MODAMOBILITY = require("../models/modamobility");

const protect = require("../middleware/protectRoutes");
const mfaVerify = require("../middleware/mfaVerify");
const geoLock = require("../middleware/geoLock");

const auditLog = require("../utils/auditLog");
const modlinkLogger = require("../../../../../../../server/middleware/logger");

// 🎚 Optional RBAC for control
const authorize = (roles = []) => {
    return (req, res, next) => {
        const userRole = req?.user?.role || "guest";
        if (!roles.includes(userRole)) {
            auditLog("🚫 Unauthorized Mobility Access", {
                user: req.user?.email,
                route: req.originalUrl,
                role: userRole,
            });
            return res.status(403).json({ message: "❌ Forbidden: insufficient role" });
        }
        next();
    };
};

// 🎓 POST /api/modamobility - Enroll student/creator
router.post("/", protect, mfaVerify, geoLock, modlinkLogger("modamobility", "create"), async (req, res) => {
    try {
        const entry = new MODAMOBILITY(req.body);
        const saved = await entry.save();
        auditLog("🎓 Mobility Entry Created", {
            user: req.user?.email,
            entryId: saved._id,
        });
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "❌ Enrollment failed", error: err.message });
    }
});

// 🧾 GET /api/modamobility - View all entries (admin/creator)
router.get("/", protect, mfaVerify, authorize(["admin", "creator"]), modlinkLogger("modamobility", "list"), async (req, res) => {
    try {
        const data = await MODAMOBILITY.find().sort({ createdAt: -1 });
        auditLog("🧾 Mobility Entries Fetched", {
            user: req.user?.email,
            count: data.length,
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "❌ Fetch failed", error: err.message });
    }
});

// 🔍 GET /api/modamobility/:id - View entry
router.get("/:id", protect, mfaVerify, modlinkLogger("modamobility", "view"), async (req, res) => {
    try {
        const entry = await MODAMOBILITY.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: "❌ Entry not found." });
        auditLog("🔍 Mobility Entry Viewed", {
            user: req.user?.email,
            entryId: req.params.id,
        });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ message: "❌ Fetch error", error: err.message });
    }
});

// ✏️ PUT /api/modamobility/:id - Full update
router.put("/:id", protect, mfaVerify, geoLock, authorize(["admin"]), modlinkLogger("modamobility", "update"), async (req, res) => {
    try {
        const updated = await MODAMOBILITY.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) return res.status(404).json({ message: "❌ Entry not found for update" });
        auditLog("✏️ Mobility Entry Updated", {
            user: req.user?.email,
            entryId: req.params.id,
        });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "❌ Update failed", error: err.message });
    }
});

// 🛠️ PATCH /api/modamobility/:id - Partial update
router.patch("/:id", protect, mfaVerify, modlinkLogger("modamobility", "patch"), async (req, res) => {
    try {
        const updated = await MODAMOBILITY.findByIdAndUpdate(req.params.id, req.body, { new: true });
        auditLog("🛠️ Mobility Entry Partially Updated", {
            user: req.user?.email,
            entryId: req.params.id,
        });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "❌ Patch failed", error: err.message });
    }
});

// 🗑️ DELETE /api/modamobility/:id - Delete entry
router.delete("/:id", protect, mfaVerify, geoLock, authorize(["admin"]), modlinkLogger("modamobility", "delete"), async (req, res) => {
    try {
        const deleted = await MODAMOBILITY.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "❌ Entry not found" });
        auditLog("🗑️ Mobility Entry Deleted", {
            user: req.user?.email,
            entryId: req.params.id,
        });
        res.json({ message: "✅ Deleted", id: deleted._id });
    } catch (err) {
        res.status(500).json({ message: "❌ Delete failed", error: err.message });
    }
});

module.exports = router;






