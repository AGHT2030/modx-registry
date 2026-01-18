/**
 * © 2025–2026 AG Holdings Trust | MODX Sovereign Technologies
 * Global Safe Require Utility
 *
 * Purpose:
 * - Prevent hard crashes when optional modules are missing
 * - Allow sovereign runtime during staged deployments
 * - Used by Identity, Governance, ETF, MODLINK layers
 */

"use strict";

function globalSafeRequire(path, fallback = null) {
    try {
        return require(path);
    } catch (err) {
        console.warn(`⚠️ SafeRequire: module not found → ${path}`);
        return fallback;
    }
}

module.exports = globalSafeRequire;
