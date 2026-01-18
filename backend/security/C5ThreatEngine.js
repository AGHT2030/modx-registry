
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
 * © 2025 Mia Lopez | C5 Threat Engine (Tier-5 Hybrid+Enterprise Mode)
 * Part of the MODX Universe Security Architecture.
 *
 * This engine performs:
 *  - Hybrid threat scoring (fast + rule-based)
 *  - Enterprise anomaly detection (governance-based)
 *  - PQC-safe envelope generation
 *  - C5 Severity emission → Dashboards, Advisor, Sentinel
 *  - Compliance-grade audit trail
 *  - Auto-escalation to Universe Gateway
 */

const { sealEnvelope } = require("../pqc/PQCEnvelope");
const { auditLog } = require("../admin/auditLogEngine");

// Universe router
const { routeToUniverseGateway } = require("../governance/gateway/UniverseGateway");

/* ============================================================
   INTERNAL SCORING TABLES
============================================================ */

const severityWeights = {
    XRPL: {
        AccountSet: 3,
        TrustSet: 4,
        OfferCreate: 5,
        AMMDeposit: 6,
        AMMCreate: 7,
        NFTokenMint: 6,
        default: 2
    },
    EVM: {
        Transfer: 2,
        Approval: 3,
        Mint: 5,
        Burn: 5,
        ProposalCreated: 6,
        ProposalQueued: 7,
        ProposalExecuted: 8,
        VoteCast: 4,
        DelegateChanged: 4,
        default: 2
    }
};

// Severity → color class mapping for dashboards
const severityLevels = [
    { label: "low", threshold: 0 },
    { label: "medium", threshold: 4 },
    { label: "high", threshold: 7 },
    { label: "critical", threshold: 10 }
];

/* ============================================================
   HYBRID SCORING ENGINE (FAST MODE)
============================================================ */

function hybridScore(chain, type, payload) {
    const weightTable = severityWeights[chain] || {};
    const baseScore = weightTable[type] || weightTable.default || 1;

    // Hybrid weighting: Use metadata to adjust score
    let modifier = 0;

    if (payload?.amm) modifier += 2;
    if (payload?.nft) modifier += 1;
    if (payload?.dex) modifier += 2;

    // Governance modifiers (enterprise tier)
    if (payload.type?.includes("ProposalExecuted")) modifier += 4;
    if (payload.type?.includes("ProposalQueued")) modifier += 3;
    if (payload.type?.includes("ProposalCreated")) modifier += 2;

    return baseScore + modifier;
}

/* ============================================================
   SEVERITY CONVERSION
============================================================ */

function convertToSeverity(score) {
    let level = "low";
    for (const step of severityLevels) {
        if (score >= step.threshold) level = step.label;
    }
    return level;
}

/* ============================================================
   MAIN PROCESSOR
============================================================ */

async function processThreat(payload) {
    try {
        const chain = payload.chain;
        const type = payload.type;

        // 1) Hybrid score
        const score = hybridScore(chain, type, payload);

        // 2) Convert to severity label
        const severity = convertToSeverity(score);

        // 3) PQC-safe sealed packet
        const sealed = await sealEnvelope({
            chain,
            type,
            severity,
            score,
            timestamp: payload.timestamp,
            origin: payload.hash || payload.txHash,
            payload
        });

        // 4) Audit log
        auditLog({
            source: "C5 Threat Engine",
            severity: severity.toUpperCase(),
            message: `Threat score ${score} (${severity}) for ${type}`,
            details: payload
        });

        // 5) Emit severity to dashboards
        if (global.io) {
            global.io.emit("c5:severity:update", {
                chain,
                severity,
                score,
                packet: sealed
            });
        }

        // 6) Auto-escalation route to Tier-5 Universe Gateway
        await routeToUniverseGateway({
            chain,
            sealed,
            severity,
            score,
            src: "C5"
        });

        return { ok: true, severity, score };

    } catch (err) {
        console.error("❌ C5 Threat Engine failure:", err);
        return { ok: false, error: err.message };
    }
}

/* ============================================================
   EXPORT
============================================================ */

module.exports = {
    processThreat
};
