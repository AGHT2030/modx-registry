
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

// © 2025 AIMAL Global Holdings | Environment Loader Hook
// CommonJS-safe loader for .env, .env.dev, or .env.override
// Ensures critical variables are available to all backend modules

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function loadEnvSafe(requiredKeys = []) {
    const baseDir = process.cwd();
    const overridePath = path.join(baseDir, ".env.override");
    const devPath = path.join(baseDir, ".env.dev");
    const mainPath = path.join(baseDir, ".env");

    // Priority: override > dev > main
    if (fs.existsSync(overridePath)) {
        dotenv.config({ path: overridePath });
        console.log(`🟡 Loaded environment: .env.override`);
    } else if (fs.existsSync(devPath)) {
        dotenv.config({ path: devPath });
        console.log(`🟢 Loaded environment: .env.dev`);
    } else if (fs.existsSync(mainPath)) {
        dotenv.config({ path: mainPath });
        console.log(`⚪ Loaded environment: .env`);
    } else {
        console.warn("⚠️ No .env file found — environment may be incomplete.");
    }

    const missing = requiredKeys.filter((k) => !process.env[k]);
    if (missing.length) {
        console.warn(`⚠️ Missing required env vars: ${missing.join(", ")}`);
    }

    const env = {};
    for (const key of requiredKeys) {
        env[key] = process.env[key] || null;
    }

    return env;
}

module.exports = { loadEnvSafe };
