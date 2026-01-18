
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

// © 2025 Mia Lopez | MODX Unified Safe Import Utility
// Handles middleware and route imports gracefully.

const fs = require("fs");
const path = require("path");

function safeImport(modulePath, name = "UnnamedMiddleware") {
    try {
        let fullPath = path.join(process.cwd(), modulePath);
        const tryExtensions = [".js", ".cjs", ".mjs"];

        if (!fs.existsSync(fullPath)) {
            for (const ext of tryExtensions) {
                if (fs.existsSync(fullPath + ext)) {
                    fullPath += ext;
                    break;
                }
            }
        }

        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Module not found: ${name} (${fullPath})`);
            return (req, res, next) => next(); // graceful noop
        }

        const mod = require(fullPath);
        const resolved = mod.default || mod;

        if (typeof resolved === "function" || (resolved && typeof resolved.handle === "function")) {
            console.log(`✅ Imported module: ${name}`);
            return resolved;
        }

        console.warn(`⚠️ ${name} is not a valid middleware (type: ${typeof resolved})`);
        return (req, res, next) => next();
    } catch (err) {
        console.error(`❌ Failed to import ${name}: ${err.message}`);
        return (req, res, next) => next();
    }
}

module.exports = { safeImport };
