
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

// © 2025 AIMAL Global Holdings | MODLINK Event Log & Diagnostics Routes
// Provides secure access to stored event logs with filters & pagination,
// plus unified /api/modlink/test endpoint for live health checks.

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { loadVault } = require("../vault");
const registry = require("../registry");
const logger = require("../../../logger");
const adminAuth = require("../middleware/adminAuth");
const EventLog = require("../models/EventLog");

/* --------------------------------------------------
   🔹 EXISTING EVENT LOG ROUTES
-------------------------------------------------- */

// 🔍 GET /api/modlink/events
// ?dao=FinanceDAO&limit=50
router.get("/", adminAuth, async (req, res) => {
    try {
        const { dao, limit = 100 } = req.query;
        const query = dao ? { dao } : {};
        const logs = await EventLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        res.json({ count: logs.length, logs });
    } catch (err) {
        logger.error("Failed to retrieve logs:", err);
        res.status(500).json({ error: "Failed to retrieve logs" });
    }
});

// 📅 GET /api/modlink/events/range?start=...&end=...
router.get("/range", adminAuth, async (req, res) => {
    try {
        const { start, end } = req.query;
        const query = {};
        if (start || end) {
            query.createdAt = {};
            if (start) query.createdAt.$gte = new Date(start);
            if (end) query.createdAt.$lte = new Date(end);
        }
        const logs = await EventLog.find(query).sort({ createdAt: -1 }).limit(500);
        res.json({ range: { start, end }, count: logs.length, logs });
    } catch (err) {
        logger.error("Date range query failed:", err);
        res.status(500).json({ error: "Date range query failed" });
    }
});

// 🧹 DELETE /api/modlink/events/clear
router.delete("/clear", adminAuth, async (req, res) => {
    try {
        await EventLog.deleteMany({});
        res.json({ status: "ok", message: "All event logs cleared." });
    } catch (err) {
        logger.error("Failed to clear logs:", err);
        res.status(500).json({ error: "Failed to clear logs" });
    }
});

/* --------------------------------------------------
   🔹 NEW /api/modlink/test — Unified Self-Check
-------------------------------------------------- */

router.get("/test", async (req, res) => {
    const result = {
        timestamp: new Date().toISOString(),
        status: "ok",
        checks: {},
    };

    try {
        // ✅ Vault check
        const vault = loadVault();
        result.checks.vault = {
            hasVault: !!vault && Object.keys(vault).length > 0,
            timestamp: vault?.timestamp,
        };

        // ✅ MongoDB check
        try {
            const state = mongoose.connection.readyState;
            const states = ["disconnected", "connected", "connecting", "disconnecting"];
            result.checks.mongodb = {
                state: states[state] || "unknown",
                uri: process.env.MONGO_URI ? "set" : "missing",
            };
        } catch (err) {
            result.checks.mongodb = { state: "error", message: err.message };
        }

        // ✅ Wallet check
        try {
            const wallet = global.CoinPurseWallet;
            result.checks.wallet = {
                connected: !!wallet?.address,
                address: wallet?.address || null,
                provider: !!global.CoinPurseProvider,
            };
        } catch (err) {
            result.checks.wallet = { connected: false, message: err.message };
        }

        // ✅ DAO registry check
        try {
            result.checks.daos = registry.listRoutes
                ? registry.listRoutes()
                : ["No DAOs registered"];
        } catch (err) {
            result.checks.daos = { error: err.message };
        }

        res.json(result);
    } catch (err) {
        logger.error("MODLINK /test route error:", err);
        res.status(500).json({ error: "Internal Test Failure", details: err.message });
    }
});

module.exports = router;
