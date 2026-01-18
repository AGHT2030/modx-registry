
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

// © 2025 AIMAL Global Holdings | MODLINK Audit
const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
    module: String,
    endpoint: String,
    userId: String,
    ip: String,
    timestamp: Date,
    status: String,
    error: String,
});

const Audit = mongoose.models.ModlinkAudit || mongoose.model("ModlinkAudit", auditSchema);

async function recordAudit(entry) {
    try {
        const log = new Audit(entry);
        await log.save();
    } catch (err) {
        console.error("⚠️ MODLINK audit save failed:", err.message);
    }
}

module.exports = { recordAudit };
