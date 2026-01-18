
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

/**
 * Easy 1-line compliance logging from anywhere in backend:
 * logCompliance(propertyId, eventType, message, metadata, severity)
 */

const ComplianceLog = require("../models/ComplianceLog");

async function logCompliance(propertyId, eventType, message, metadata = {}, severity = "info") {
    try {
        await ComplianceLog.create({
            propertyId,
            eventType,
            message,
            metadata,
            severity
        });
    } catch (err) {
        console.error("❌ Compliance Log Error:", err);
    }
}

module.exports = { logCompliance };
