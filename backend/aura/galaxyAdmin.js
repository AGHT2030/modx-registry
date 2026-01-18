
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

// © 2025 AIMAL Global Holdings | MODX Galaxy Admin API
// Provides system diagnostics + governance overview + DAO analytics.

const express = require("express");
const router = express.Router();
const os = require("os");
const fs = require("fs");
const path = require("path");

const SENTINEL_CACHE = path.join(__dirname, "../vault/galaxyIngestCache.json");

// ------------------------------------------------------------
// HEALTH: PORTS + SERVICES
// ------------------------------------------------------------
router.get("/health", (req, res) => {
    res.json({
        system: {
            uptime: process.uptime(),
            load: os.loadavg(),
            memory: process.memoryUsage(),
            platform: os.platform()
        },
        services: {
            aura: global.AURA_PORT || null,
            express: global.EXPRESS_PORT || null,
            dao_listeners: global.DAO_WATCHERS || [],
            modlink: global.MODLINK?.dao || "fallback",
            xrpl: global.XRPL_STATUS || "unknown",
            polygon: global.POLYGON_STATUS || "unknown"
        }
    });
});

// ------------------------------------------------------------
// GOVERNANCE OVERVIEW
// ------------------------------------------------------------
router.get("/governance/overview", (req, res) => {
    const events = fs.existsSync(SENTINEL_CACHE)
        ? JSON.parse(fs.readFileSync(SENTINEL_CACHE, "utf8"))
        : [];

    res.json({
        recentEvents: events.slice(-50).reverse(),
        totalEvents: events.length,
        daoRegistry: global.MODLINK?.registry || [],
        roles: global.AURA_ROLES || {},
        watchers: global.DAO_WATCHERS || []
    });
});

// ------------------------------------------------------------
// ACTIVE PROPOSALS
// ------------------------------------------------------------
router.get("/governance/proposals", async (req, res) => {
    try {
        const proposals = global.GovernanceListener?.getActiveProposals?.() || [];
        res.json({ ok: true, proposals });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

// ------------------------------------------------------------
// MANUAL FORCE-SYNC
// ------------------------------------------------------------
router.post("/sync", async (req, res) => {
    try {
        if (global.MODLINK?.sync) {
            await global.MODLINK.sync();
            return res.json({ ok: true });
        }
        res.json({ ok: false, error: "MODLINK sync unavailable" });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

// ------------------------------------------------------------
// AURA TWIN STATE
// ------------------------------------------------------------
router.get("/twins/state", (req, res) => {
    res.json({
        cognitive: global.AURA_COG || {},
        emotional: global.AURA_EMO || {}
    });
});

module.exports = router;
