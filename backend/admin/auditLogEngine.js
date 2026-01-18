
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
 * © 2025 AIMAL Global Holdings | Tier-5 Audit Log Engine
 * Unified audit logging system for:
 *  - XRPL Governance
 *  - EVM Governance
 *  - MODX Universe Gateway
 *  - Sentinel
 *  - C5 Threat Engine
 *  - AURA Policy Advisor
 *  - PQC Envelope Integrity Tracking
 *
 * Features:
 *  - Daily rotating audit files
 *  - SHA3-256 integrity hashing (PQC-ready)
 *  - Severity-tiered classification
 *  - Socket broadcasting (admin panel + dashboards)
 *  - Backwards compatible with existing implementation
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* ============================================================
   DIRECTORIES
============================================================ */
const BASE_LOG_DIR = path.join(__dirname, "../../logs");
const AUDIT_DIR = path.join(BASE_LOG_DIR, "audit");

if (!fs.existsSync(BASE_LOG_DIR)) fs.mkdirSync(BASE_LOG_DIR, { recursive: true });
if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });

/* ============================================================
   HASHER — SHA3-256 (PQC compatible)
============================================================ */
function hashEntry(entry) {
    return crypto
        .createHash("sha3-256")
        .update(JSON.stringify(entry))
        .digest("hex");
}

/* ============================================================
   FORMATTER
============================================================ */
function formatEntry(entry) {
    return `[${entry.timestamp}] [${entry.severity}] [${entry.source}] ${entry.message
        } ${entry.details ? JSON.stringify(entry.details) : ""}`;
}

/* ============================================================
   FILE WRITER — daily log files
============================================================ */
function writeToFile(entry) {
    const date = entry.timestamp.slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(AUDIT_DIR, `${date}.log`);
    try {
        fs.appendFileSync(filePath, JSON.stringify(entry) + "\n");
    } catch (err) {
        console.error("❌ Audit log write failed:", err.message);
    }
}

/* ============================================================
   SOCKET EMITTERS
============================================================ */
// PRIMARY (Tier-5 dashboard + Universe Ops Console)
function emitUnified(entry) {
    if (global.io) {
        global.io.emit("audit:entry", entry); // new Tier-5 pipeline stream
    }
}

// BACKWARD COMPATIBILITY (Admin Panel)
function emitLegacy(entry) {
    if (global.io) {
        global.io.emit("admin:audit:event", entry); // keep legacy UI working
    }
}

/* ============================================================
   MAIN CALL
============================================================ */
function auditLog({ severity = "INFO", source = "SYSTEM", message, details }) {
    const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
        severity,
        source,
        message,
        details: details || null,
        hash: null,
    };

    // SHA3 hash for PQC integrity
    entry.hash = hashEntry(entry);

    // File write
    writeToFile(entry);

    // Live broadcast
    emitUnified(entry); // new
    emitLegacy(entry);  // backward compatibility

    return entry;
}

module.exports = {
    auditLog,
    AUDIT_DIR
};
