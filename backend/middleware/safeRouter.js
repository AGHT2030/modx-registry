
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

// © 2025 Mia Lopez | AIMAL Global Holdings | safeRouter.js
// 🔧 Universal wrapper for safe Express route mounting.
// Prevents "Router.use() requires a middleware function but got an Object" errors
// by validating and normalizing all middleware exports before Express receives them.
// Adds MODLINK + AURA awareness for synchronized galaxy health reporting.

const chalk = require("chalk");

/**
 * Safely wraps a middleware or router import before app.use().
 * Ensures the return is always a callable Express-compatible handler.
 * @param {*} routeModule - imported router/middleware module
 * @param {string} label - human-readable name for logs
 * @returns {Function} - always returns a middleware function
 */
function safeRouter(routeModule, label = "UnnamedModule") {
    try {
        // ✅ Handle default export cases (ESM/CJS interop)
        const mod = routeModule?.default || routeModule;

        // 🧠 Case 1: Direct callable function (valid middleware)
        if (typeof mod === "function") {
            console.log(chalk.greenBright(`✅ Mounted route: /api/${label}`));
            logToAURA(label, "function");
            return mod;
        }

        // 🚀 Case 2: Express Router object
        if (mod && typeof mod.use === "function" && typeof mod.handle === "function") {
            console.log(chalk.cyan(`✅ Mounted Express router: /api/${label}`));
            logToAURA(label, "router");
            return mod;
        }

        // ⚠️ Case 3: Invalid or unexpected type — fallback
        console.warn(
            chalk.yellowBright(
                `⚠️ ${label} is not a valid middleware or router (type: ${typeof mod}) — fallback activated.`
            )
        );
        logToAURA(label, "fallback");

        return function fallback(req, res, next) {
            console.warn(
                chalk.yellow(`⚠️ Fallback router triggered for ${label} — continuing request flow.`)
            );
            next();
        };
    } catch (err) {
        console.error(chalk.red(`❌ safeRouter() failed for ${label}:`), err.message);
        logToAURA(label, "error", err.message);

        // 🛡️ Fail-safe handler — Express always receives a valid function
        return function failSafe(req, res, next) {
            console.warn(chalk.red(`⚠️ Failsafe router triggered for ${label}`));
            next();
        };
    }
}

/* ---------------------------------------------------------------------------
   🌐 AURA / MODLINK Awareness
   Registers route mount events for system diagnostics in the Universe Gateway.
--------------------------------------------------------------------------- */
function logToAURA(label, status = "unknown", message = "") {
    try {
        // Create lightweight galaxy log for Universe Gateway
        const event = {
            label,
            status,
            message,
            timestamp: new Date().toISOString(),
            source: "safeRouter",
        };

        // If AURA or MODLINK DAO is active, emit to logs
        if (global.io) {
            global.io.emit("galaxy:route:mount", event);
        }
        if (global.MODLINK?.dao) {
            console.log(
                chalk.magentaBright(`🪐 [MODLINK DAO] Synced mount event for: ${label} (${status})`)
            );
        }
    } catch (err) {
        console.warn(
            chalk.gray(`⚙️ AURA logToAURA() failed for ${label}: ${err.message}`)
        );
    }
}

/* ---------------------------------------------------------------------------
   ✅ CommonJS Export (Guaranteed Callable)
--------------------------------------------------------------------------- */
module.exports = safeRouter;
