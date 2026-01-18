
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

// © 2025 Mia Lopez | CoinPurse™ Universal Middleware Loader
// ----------------------------------------------------------
// Prevents console spam by safely preloading missing middleware.
// Any missing file returns a silent Express-compatible stub.

const path = require("path");
const fs = require("fs");

// ✅ Middleware names expected by the system
const middlewareList = [
    "modeSessionHandler",
    "creatvSessionSync",
    "airsMiddleware",
    "modaStayHybrid",
    "coinpurseMiddleware",
];

// 🔹 Helper: safely require or create stub
function safeLoad(name) {
    const possiblePaths = [
        path.resolve(__dirname, `${name}.js`),
        path.resolve(__dirname, `../../middleware/${name}.js`),
        path.resolve(__dirname, `../../routes/api/${name}.js`),
    ];

    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(`✅ Loaded middleware: ${name}`);
            try {
                return require(filePath);
            } catch (err) {
                console.warn(`⚠️ Error loading ${name}:`, err.message);
                break;
            }
        }
    }

    // Silent Express stub — does nothing, logs nothing
    return function (req, res, next) {
        next();
    };
}

// 🔸 Build export object
const middleware = {};
for (const name of middlewareList) {
    middleware[name] = safeLoad(name);
}

module.exports = middleware;
