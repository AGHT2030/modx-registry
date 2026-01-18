/**
 * © 2025–2026 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * AIRS Concierge Routes — CJS Adapter for ESM
 * GOVERNANCE-SAFE BRIDGE
 *
 * 🔒 CRITICAL GUARANTEES:
 * 1. ESM routes are NEVER imported until MODLINK proof passes
 * 2. Router is cached after first verified load
 * 3. Any failure returns governance-safe denial (never partial execution)
 */

"use strict";

let _routerCache = null;
let _loading = false;

/**
 * Load the AIRS ESM router exactly once, AFTER governance passes
 */
async function loadAirsRouter() {
    if (_routerCache) return _routerCache;

    if (_loading) {
        // prevent concurrent double-load
        await new Promise((r) => setTimeout(r, 5));
        return _routerCache;
    }

    _loading = true;

    try {
        const mod = await import("./concierge.routes.js");
        _routerCache = mod.default || mod;
        return _routerCache;
    } catch (err) {
        console.error("❌ AIRS ESM route load failed:", err);
        throw new Error("AIRS_ROUTE_IMPORT_FAILED");
    } finally {
        _loading = false;
    }
}

/**
 * Express-compatible handler
 * This function is mounted ONLY AFTER requireModlinkProof middleware
 */
module.exports = async function airsGovernedHandler(req, res, next) {
    try {
        const router = await loadAirsRouter();
        if (typeof router !== "function") {
            throw new Error("AIRS_ROUTER_INVALID");
        }
        return router(req, res, next);
    } catch (err) {
        return res.status(500).json({
            error: "AIRS_GOVERNANCE_BRIDGE_ERROR",
            reason: "DENY_INTERNAL",
            message: err.message,
        });
    }
};

/**
 * 🔍 Test / inspection hooks (non-production)
 */
module.exports._test = {
    isLoaded: () => Boolean(_routerCache),
    reset: () => {
        _routerCache = null;
        _loading = false;
    },
};
