
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
 * © 2025 AIMAL Global Holdings | Compliance Inbox Store (Tier-5)
 *
 * Stores and manages compliance-grade governance events.
 * Integrated with:
 *  - Universe Gateway
 *  - C5 Threat Engine
 *  - Sentinel Core
 *  - Policy Advisor
 *  - XRPL + EVM Governance Listeners
 *
 * Supports:
 *  - CaseID assignment
 *  - Triage workflow (LOW → CRITICAL)
 *  - File persistence (daily JSONL logs)
 *  - AGVault case vault
 *  - Memory caching
 *  - Real-time inbox updates to frontend
 *  - PQC-ready sealed packet logging
 */

const fs = require("fs");
const path = require("path");
const { auditLog } = require("../admin/auditLogEngine");

// --------------------------------------------------------------
// DIRECTORY SETUP
// --------------------------------------------------------------
const BASE_DIR = path.join(__dirname, "../../logs");
const COMPLIANCE_DIR = path.join(BASE_DIR, "compliance");
const VAULT_DIR = path.join(__dirname, "../../AGVault/governance_inbox");

if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });
if (!fs.existsSync(COMPLIANCE_DIR)) fs.mkdirSync(COMPLIANCE_DIR, { recursive: true });
if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });

// Memory inbox
let inbox = [];

/* ======================================================================
   DAILY ROTATING LOG FILE WRITER
====================================================================== */
function writeToFile(entry) {
    const day = entry.timestamp.slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(COMPLIANCE_DIR, `${day}.jsonl`);

    try {
        fs.appendFileSync(filePath, JSON.stringify(entry) + "\n");
    } catch (err) {
        console.error("❌ Compliance Inbox write failure:", err.message);
    }
}

/* ======================================================================
   SAVE TO AGVAULT (permanent case file)
====================================================================== */
function saveToVault(entry) {
    const file = path.join(VAULT_DIR, `${entry.caseId}.json`);
    try {
        fs.writeFileSync(file, JSON.stringify(entry, null, 2));
    } catch (err) {
        console.warn("⚠️ Vault write failed:", err.message);
    }
}

/* ======================================================================
   TRIAGE WORKFLOW ENGINE
====================================================================== */
function triage(entry) {
    const sev = (entry.severity || "LOW").toUpperCase();

    // Default
    entry.status = "RECEIVED";

    if (sev === "LOW") {
        entry.status = "LOGGED";
    }

    if (sev === "MEDIUM") {
        entry.status = "REVIEW_REQUIRED";

        global.io?.emit("compliance:review:required", entry);

        auditLog({
            severity: "INFO",
            source: "Compliance Inbox",
            message: `Medium-severity review required (${entry.caseId})`,
            details: entry
        });
    }

    if (sev === "HIGH") {
        entry.status = "ESCALATED_SENTINEL";

        global.io?.emit("compliance:sentinel:escalation", entry);

        auditLog({
            severity: "HIGH",
            source: "Compliance Inbox",
            message: `High-severity escalation to Sentinel (${entry.caseId})`,
            details: entry
        });
    }

    if (sev === "CRITICAL") {
        entry.status = "CRITICAL_INTERVENTION";

        global.io?.emit("compliance:critical", entry);

        auditLog({
            severity: "CRITICAL",
            source: "Compliance Inbox",
            message: "🚨 CRITICAL governance incident escalated.",
            details: entry
        });
    }

    return entry;
}

/* ======================================================================
   MAIN INGEST / ROUTING FUNCTION
====================================================================== */
function routeEvent(event) {
    // Determine severity from packet chain
    const sev =
        event.severity ||
        event.packet?.threat?.level ||
        event.packet?.sentinel?.level ||
        "LOW";

    const caseId = `CASE-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const entry = {
        caseId,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
        source: event.source || event.packet?.chain || "UNKNOWN",
        severity: sev,
        governance_type:
            event.governance_type ||
            event.packet?.type ||
            "UNSPECIFIED",
        summary:
            event.summary ||
            event.packet?.advisory?.action ||
            event.packet?.type ||
            "Governance event",
        packet: event.packet || event,
        xcgid: event.packet?.xcgid || null,
        status: "RECEIVED"
    };

    // Add to memory inbox
    inbox.unshift(entry);

    // Persist to daily log file
    writeToFile(entry);

    // Save as a dedicated case file in AGVault
    saveToVault(entry);

    // Send to triage engine
    triage(entry);

    // Real-time update for dashboards
    global.io?.emit("compliance:inbox:update", entry);

    return entry;
}

/* ======================================================================
   GET ENTIRE INBOX (memory)
====================================================================== */
function getAll() {
    return inbox;
}

/* ======================================================================
   CLEAR INBOX
====================================================================== */
function clearInbox() {
    inbox = [];
}

/* ======================================================================
   EXPORTS
====================================================================== */
module.exports = {
    routeEvent,
    getAll,
    clearInbox,
    COMPLIANCE_DIR,
    VAULT_DIR
};
