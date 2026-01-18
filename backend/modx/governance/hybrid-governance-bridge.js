
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
 * © 2025 Mia Lopez | MODX Hybrid Governance Bridge (C4 + C5 Mode)
 *
 * C4 → Cross-chain unified governance aggregator:
 *   - XRPL Governance (C3)
 *   - EVM / Polygon Governance
 *   - MODLINK DAO Governance Signals
 *
 * C5 → Adaptive Severity Engine (Universe Gateway → Sentinel → Frontend)
 *
 * Normalizes → scores → routes → broadcasts to:
 *   Sentinel, Policy Advisor, Compliance Inbox, AURA Twins,
 *   MODLINK DAO, CoinPurse dashboards, Heat Map (C5).
 */

const fs = require("fs");
const path = require("path");
const complianceBus = require("../../coinpurse/complianceInboxBus");
const sentinel = require("./outlierSentinel.cjs");
const advisor = require("./twinsPolicyAdvisor.cjs");

// NEW: Audit Log Engine
const { auditLog } = require("../../admin/auditLogEngine");

// NEW: Optional C5 Threat Engine feed
let c5 = null;
try {
    c5 = require("./c5-threat-processor.cjs");
} catch {
    c5 = null;
}

const PQC = global.PQC || {
    sign: (d) => ({ integrity: "none", timestamp: Date.now() }),
    verify: () => true
};

// Unified audit log
const C4_LOG = path.join(__dirname, "c4-governance-log.json");

/* -----------------------------------------------------
   🔐 Log writer (rotates last 2000 entries)
----------------------------------------------------- */
function writeLog(entry) {
    try {
        const logs = fs.existsSync(C4_LOG)
            ? JSON.parse(fs.readFileSync(C4_LOG, "utf8"))
            : [];

        logs.push(entry);
        fs.writeFileSync(C4_LOG, JSON.stringify(logs.slice(-2000), null, 2));
    } catch (err) {
        console.warn("⚠️ Failed to write C4 log:", err.message);
    }
}

/* -----------------------------------------------------
   🔄 Internal Queues
----------------------------------------------------- */
let XRPL_QUEUE = [];
let EVM_QUEUE = [];
let MODLINK_QUEUE = [];

const RATE_LIMIT_MS = 250;
let lastEmit = 0;

/* -----------------------------------------------------
   🌡️ C5 GLOBAL STATE — Severity Summary
----------------------------------------------------- */
let C5_SUMMARY = {
    severity: "low",
    counts: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
    },
    lastEventAt: null,
    lastEventType: null,
    lastChain: null,
    lastHash: null
};

function classifySeverityFromRisk(risk) {
    if (!risk) return "low";

    if (typeof risk === "object") {
        if (risk.severity) {
            const s = risk.severity.toLowerCase();
            if (["low", "medium", "high", "critical"].includes(s)) return s;
        }
        if (typeof risk.score === "number") {
            const s = risk.score;
            if (s < 25) return "low";
            if (s < 50) return "medium";
            if (s < 75) return "high";
            return "critical";
        }
    }

    if (typeof risk === "number") {
        const s = risk;
        if (s < 25) return "low";
        if (s < 50) return "medium";
        if (s < 75) return "high";
        return "critical";
    }

    return "low";
}

/* -----------------------------------------------------
   🧩 Normalizer (Cross-chain → MODX Standard Format)
----------------------------------------------------- */
function normalizeEvent(source, raw) {
    return {
        chain:
            source.startsWith("XRPL")
                ? "XRPL"
                : source.startsWith("EVM")
                    ? "EVM"
                    : "MODLINK",

        source,
        type: raw.type || raw.action || raw.event || "Unknown",
        hash: raw.hash || raw.txHash || raw.id || null,

        token: raw.token || raw.asset || null,

        account: raw.account || raw.from || null,
        destination: raw.destination || raw.to || null,

        block: raw.blockNumber || raw.ledgerIndex || raw.height || null,
        meta: raw.meta || raw.details || null,

        amm: raw.amm || null,
        nft: raw.nft || null,
        dex: raw.dex || null,

        gov: raw.gov || null,

        timestamp: raw.timestamp || new Date().toISOString()
    };
}

/* -----------------------------------------------------
   🧠 Central Governance Processor (C4 + C5 Engine)
----------------------------------------------------- */
async function processUnifiedEvent(evt) {
    try {
        /* ---------------------------------------------------
           1️⃣ SENTINEL RISK EVALUATION
        --------------------------------------------------- */
        const risk = await sentinel.evaluateImpact(evt, []);
        evt.risk = risk;

        /* ---------------------------------------------------
           2️⃣ POLICY ADVISOR RECOMMENDATION (AURA Twins)
        --------------------------------------------------- */
        const advisory = await advisor.generateAdvisory(evt);
        evt.advisory = advisory;

        /* ---------------------------------------------------
           3️⃣ COMPLIANCE INBOX
        --------------------------------------------------- */
        complianceBus.push({
            source: evt.chain,
            event: evt,
            advisory
        });

        /* ---------------------------------------------------
           4️⃣ UPDATE C5 SEVERITY STATE
        --------------------------------------------------- */
        const sev = classifySeverityFromRisk(risk);

        C5_SUMMARY.counts[sev] = (C5_SUMMARY.counts[sev] || 0) + 1;
        C5_SUMMARY.severity = sev;
        C5_SUMMARY.lastEventAt = evt.timestamp;
        C5_SUMMARY.lastEventType = evt.type;
        C5_SUMMARY.lastChain = evt.chain;
        C5_SUMMARY.lastHash = evt.hash;

        /* ---------------------------------------------------
           5️⃣ BROADCAST TO AURA TWINS + FRONTEND
        --------------------------------------------------- */
        if (global.io) {
            global.io.emit("governance:hybrid:event", evt);
            global.io.emit("c5:severity:update", {
                severity: C5_SUMMARY.severity,
                counts: C5_SUMMARY.counts,
                lastEventAt: C5_SUMMARY.lastEventAt,
                lastEventType: C5_SUMMARY.lastEventType,
                lastChain: C5_SUMMARY.lastChain,
                lastHash: C5_SUMMARY.lastHash
            });
        }

        /* ---------------------------------------------------
           6️⃣ MODLINK DAO BRIDGE
        --------------------------------------------------- */
        if (global.MODLINK?.dao?.emitGovernance) {
            global.MODLINK.dao.emitGovernance(evt);
        }

        /* ---------------------------------------------------
           7️⃣ C5 THREAT ENGINE FORWARDING
        --------------------------------------------------- */
        if (c5 && c5.processC5) {
            try {
                await c5.processC5({
                    chain: evt.chain,
                    type: evt.type,
                    hash: evt.hash,
                    gov: evt.gov,
                    risk: evt.risk,
                    advisory: evt.advisory,
                    timestamp: evt.timestamp
                });
            } catch (err) {
                console.error("⚠️ Failed to forward C4 event to C5:", err.message);
            }
        }

        /* ---------------------------------------------------
           8️⃣ AUDIT LOG — SEC/GRC level
        --------------------------------------------------- */
        auditLog({
            severity: sev.toUpperCase(),
            source: `C4 Governance Bridge (${evt.chain})`,
            message: `Unified governance event processed: ${evt.type}`,
            details: evt
        });

        /* ---------------------------------------------------
           9️⃣ LOCAL LOG ROTATION
        --------------------------------------------------- */
        writeLog(evt);

        console.log(
            `🔮 [C4/C5] Unified Governance Event (${evt.chain}) → ${evt.type} | Severity: ${sev} | Risk: ${risk?.score || "n/a"}`
        );

    } catch (err) {
        console.error("❌ C4/C5 Governance processor failure:", err.message);
    }
}

/* -----------------------------------------------------
   🔥 C4 Ingest — XRPL → Unified Governance
----------------------------------------------------- */
function ingestXRPL(raw) {
    const evt = normalizeEvent("XRPL_C3", raw);
    XRPL_QUEUE.push(evt);
    pumpHybrid();
}

/* -----------------------------------------------------
   ⚡ C4 Ingest — EVM / Polygon → Unified Governance
----------------------------------------------------- */
function ingestEVM(raw) {
    const evt = normalizeEvent("EVM_C3", raw);
    EVM_QUEUE.push(evt);
    pumpHybrid();
}

/* -----------------------------------------------------
   🟡 C4 Ingest — MODLINK DAO → Unified Governance
----------------------------------------------------- */
function ingestMODLINK(raw) {
    const evt = normalizeEvent("MODLINK_C3", raw);
    MODLINK_QUEUE.push(evt);
    pumpHybrid();
}

/* -----------------------------------------------------
   🚀 C4 Pump — Merge XRPL + EVM + MODLINK Queues
----------------------------------------------------- */
async function pumpHybrid() {
    const now = Date.now();
    if (now - lastEmit < RATE_LIMIT_MS) return;
    lastEmit = now;

    const batch = [...XRPL_QUEUE, ...EVM_QUEUE, ...MODLINK_QUEUE];

    XRPL_QUEUE = [];
    EVM_QUEUE = [];
    MODLINK_QUEUE = [];

    for (const evt of batch) {
        await processUnifiedEvent(evt);
    }
}

/* -----------------------------------------------------
   📊 Public accessor for C5 summary
----------------------------------------------------- */
function getC5Summary() {
    return { ...C5_SUMMARY };
}

/* -----------------------------------------------------
   📡 EXPORTS
----------------------------------------------------- */
module.exports = {
    ingestXRPL,
    ingestEVM,
    ingestMODLINK,
    pumpHybrid,
    getC5Summary
};
