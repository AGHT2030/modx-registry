
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
 * © 2025 AIMAL Global Holdings | Sentinel Core (Tier-5)
 *
 * Sentinel = Real-time Governance Integrity Monitor
 *
 * Responsibilities:
 *  - Tracks volatility in governance signals
 *  - Detects anomalies (suspicious sequences)
 *  - Issues Sentinel Alerts → Dashboards & Advisor
 *  - Feeds Universe Gateway + Compliance Inbox
 *  - Operates in Tier-5 hybrid mode (fast, lightweight)
 */

const { auditLog } = require("../admin/auditLogEngine");

let lastEvent = null;
let anomalyScore = 0;

/* ============================================================
   RULESET (Tier-5 hybrid)
============================================================ */

const anomalyWeights = {
    "ProposalExecuted": 4,
    "ProposalQueued": 3,
    "ProposalCreated": 2,
    "VoteCast": 1,
    "DelegateChanged": 1,
    "Transfer": 0.5,
    "Mint": 2,
    "Burn": 2,
    XRPL: {
        "OfferCreate": 2,
        "OfferCancel": 1,
        "AMMDeposit": 3,
        "AMMCreate": 4,
        "NFTokenMint": 3,
    }
};

/* ============================================================
   CORE FUNCTION
============================================================ */
function processSentinelEvent(packet) {
    const type = packet?.type || "";
    const chain = packet?.chain || "";

    let weight = 1;

    // EVM weights
    if (anomalyWeights[type]) weight = anomalyWeights[type];

    // XRPL weights
    if (chain === "XRPL" && anomalyWeights.XRPL[type]) {
        weight = anomalyWeights.XRPL[type];
    }

    // Compute anomaly delta
    let delta = weight;

    if (lastEvent && lastEvent.type === type) {
        // repeating high-impact events → suspicious
        delta += 2;
    }

    anomalyScore += delta;

    // Emit to dashboards
    if (global.io) {
        global.io.emit("sentinel:alert", {
            type,
            chain,
            delta,
            anomalyScore,
            timestamp: packet.timestamp
        });
    }

    // Log anomaly
    auditLog({
        severity: anomalyScore > 10 ? "CRITICAL" : "HIGH",
        source: "SentinelCore",
        message: `Sentinel anomaly detected (Δ${delta})`,
        details: { type, chain, anomalyScore }
    });

    // Store for next evaluation cycle
    lastEvent = { type, chain };

    return { ok: true, anomalyScore };
}

/* ============================================================
   EXPORT
============================================================ */
module.exports = {
    processSentinelEvent
};
