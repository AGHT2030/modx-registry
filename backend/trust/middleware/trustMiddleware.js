
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

// © 2025 AIMAL Global Holdings | Trust Middleware (CJS Version)
// Ensures all incoming requests have valid trust signatures,
// integrates PQC Shield, verifies AG Holdings Trust Seal,
// and attaches trust context to Universe state.

const fs = require("fs");
const path = require("path");

// PQC Shield loader
const PQC_Shield = require("../../security/pqc/PQC_Shield.js");

// Trust Nexus loader
const TrustNexus = require("../trust_Nexus.js");

module.exports = function trustMiddleware(req, res, next) {
    try {
        // ------------------------------------------------------------
        // 1️⃣ Validate PQC Shield — post-quantum signature security
        // ------------------------------------------------------------
        const pqcStatus = PQC_Shield.validate({
            method: req.method,
            path: req.originalUrl,
            timestamp: Date.now()
        });

        if (!pqcStatus.valid) {
            return res.status(401).json({
                error: "PQC_SHIELD_REJECTION",
                detail: pqcStatus
            });
        }

        // ------------------------------------------------------------
        // 2️⃣ Validate AG Holdings Trust Seal (immutability layer)
        // ------------------------------------------------------------
        const trustStatus = TrustNexus.validateSeal();

        if (!trustStatus.validated) {
            return res.status(403).json({
                error: "TRUST_SEAL_INVALID",
                detail: trustStatus
            });
        }

        // ------------------------------------------------------------
        // 3️⃣ Attach trust context to request
        // ------------------------------------------------------------
        req.trust = {
            pqc: pqcStatus,
            seal: trustStatus,
            timestamp: Date.now(),
        };

        next();
    } catch (err) {
        console.error("❌ Trust Middleware Error:", err);
        return res.status(500).json({
            error: "TRUST_MIDDLEWARE_FAILURE",
            detail: err.message,
        });
    }
};
