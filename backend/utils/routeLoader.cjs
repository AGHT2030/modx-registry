
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

// © 2025 AIMAL Global Holdings
// Hybrid-safe route loader — supports .js, .cjs, and .mjs routes with unified diagnostics

const path = require("path");
const fs = require("fs");
const express = require("express");
const chalk = require("chalk");

/**
 * Safely loads any route module (CommonJS or ESM) and returns an Express router.
 * Adds intelligent file detection (.js, .cjs, .mjs) and clear diagnostics.
 * @param {string} modulePath - Relative path from project root (no extension needed)
 * @param {string} [name] - Optional readable route name for logs
 * @returns {express.Router|function} Router or middleware fallback
 */
function safeRoute(modulePath, name = null) {
    try {
        let fullPath = path.join(process.cwd(), modulePath);

        // 🧩 Auto-detect missing extension (.js / .cjs / .mjs)
        if (!fs.existsSync(fullPath)) {
            const tryExtensions = [".js", ".cjs", ".mjs"];
            for (const ext of tryExtensions) {
                if (fs.existsSync(fullPath + ext)) {
                    fullPath = fullPath + ext;
                    break;
                }
            }
        }

        if (!fs.existsSync(fullPath)) {
            console.warn(chalk.yellow(`⚠️ Route not found: ${fullPath}`));
            const fallback = express.Router();
            fallback.get("/", (_, res) =>
                res.status(404).json({ ok: false, msg: `Route not found: ${modulePath}` })
            );
            return fallback;
        }

        const mod = require(fullPath);
        const router = mod?.default || mod?.router || mod?.handler || mod;

        if (typeof router === "function" || router instanceof express.Router) {
            console.log(chalk.green(`✅ Mounted route: ${name || modulePath}`));
            return router;
        }

        console.warn(
            chalk.yellow(`⚠️ Route ${name || modulePath} invalid export type: ${typeof router}`)
        );
        const fallback = express.Router();
        fallback.get("/", (_, res) =>
            res
                .status(503)
                .json({ ok: false, msg: `Route inactive: ${name || modulePath}` })
        );
        return fallback;
    } catch (err) {
        console.error(chalk.red(`❌ Route load failed: ${name || modulePath} — ${err.message}`));
        const fallback = express.Router();
        fallback.get("/", (_, res) =>
            res.status(500).json({ ok: false, msg: "Route load error", details: err.message })
        );
        return fallback;
    }
}

module.exports = { safeRoute };
