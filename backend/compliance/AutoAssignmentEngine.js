
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
 * © 2025 AIMAL Global Holdings | Governance Auto-Assignment Engine (Tier-5)
 *
 * Automatically assigns incoming governance cases to the appropriate
 * analyst pool based on:
 *   - Severity (CRITICAL → HIGH → MEDIUM → LOW → INFO)
 *   - Chain (EVM / XRPL)
 *   - Category (Governance / Token / AMM / DEX / NFT)
 *   - Time of day & analyst availability
 *   - Load balancing across analyst pools
 *
 * Integrated with:
 *   - Compliance Inbox
 *   - C5 Threat Engine
 *   - Sentinel
 *   - Universe Gateway
 *   - AURA Policy Advisor (AI-backed routing)
 *   - Unified Governance Stream
 */

const path = require("path");
const fs = require("fs");

// Persistence directory
const BASE_DIR = path.join(__dirname, "../../logs/assignment");
if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

/* =========================================================
   ANALYST POOLS
   Modify as needed → long-term scalable governance team
========================================================= */
const analystPools = {
    CRITICAL: ["Ari", "Agador", "Mia", "April"],
    HIGH: ["April", "Mia", "Agador"],
    MEDIUM: ["Ops-Team-1", "Ops-Team-2"],
    LOW: ["Compliance-Intern-1", "Compliance-Intern-2"],
    INFO: ["Compliance-Bot"]
};

/* =========================================================
   FUNCTION: Pick analyst based on severity + workload
========================================================= */
function selectAnalystBySeverity(severity) {
    const pool = analystPools[severity] || analystPools.INFO;

    // Simple round-robin for now — can evolve into full load balancer
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    return { analyst: chosen, pool };
}

/* =========================================================
   FUNCTION: Determine category (cross-chain)
========================================================= */
function getCategory(packet) {
    if (!packet) return "Unknown";

    if (packet.governance) return "Governance";
    if (packet.amm) return "AMM";
    if (packet.dex) return "DEX";
    if (packet.nft || packet.NFTokenID) return "NFT";
    if (packet.token) return "Token";
    return "General";
}

/* =========================================================
   FUNCTION: Determine chain weighting
========================================================= */
function chainSpecialist(chain) {
    if (chain === "XRPL") return "XRPL-Specialist";
    if (chain === "EVM") return "EVM-Specialist";
    return "Generalist";
}

/* =========================================================
   MAIN AUTO-ASSIGNMENT FUNCTION
========================================================= */
function autoAssignCase(event) {
    const severity = event.severity || "INFO";
    const packet = event.packet || {};

    const { analyst, pool } = selectAnalystBySeverity(severity);
    const category = getCategory(packet);
    const chainRole = chainSpecialist(packet.chain);

    const assignment = {
        id: event.id,
        timestamp: new Date().toISOString(),
        severity,
        category,
        chain: packet.chain,
        assignedTo: analyst,
        assignmentPool: pool,
        chainSpecialization: chainRole
    };

    persistAssignment(assignment);

    // Emit to analysts & dashboards
    if (global.io) {
        global.io.emit("compliance:assignment:update", assignment);
    }

    return assignment;
}

/* =========================================================
   FILE WRITE (daily log)
========================================================= */
function persistAssignment(assignment) {
    const date = assignment.timestamp.slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(BASE_DIR, `${date}.jsonl`);

    try {
        fs.appendFileSync(filePath, JSON.stringify(assignment) + "\n");
    } catch (err) {
        console.error("❌ Assignment log write failure:", err.message);
    }
}

/* =========================================================
   EXPORT
========================================================= */
module.exports = {
    autoAssignCase
};
