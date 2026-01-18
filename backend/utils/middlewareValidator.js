
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

// © 2025 AG Holdings | Middleware Validator
// 📂 backend/utils/middlewareValidator.js

/**
 * Expected usage:
 *   const validate = require("../utils/middlewareValidator");
 *   router.post("/...", validate("secureAdmin", secureAdmin));
 */

function validate(context, middlewareFn) {
    // Return an Express-compatible middleware
    return (req, res, next) => {
        try {
            console.log(`🔍 Validator running for: ${context}`);

            if (typeof middlewareFn === "function") {
                return middlewareFn(req, res, next);
            }

            next();
        } catch (err) {
            console.error("Middleware Validator Error:", err.message);
            res.status(500).json({ error: "Middleware validation failure" });
        }
    };
}

// ✅ Export the function itself, not an object
module.exports = validate;




