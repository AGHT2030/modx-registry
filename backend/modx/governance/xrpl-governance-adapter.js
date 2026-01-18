
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
 * © 2025 AIMAL Global Holdings | XRPL Governance Adapter (Tier-1 C4 Mode)
 *
 * Listens to XRPL issuer account events and standardizes them into
 * MODX-Unified Governance Packets for:
 *  - Outlier Sentinel
 *  - AURA Policy Advisor
 *  - Compliance Inbox
 *  - Admin Governance Dashboard
 *  - Hybrid C4 Bridge (EVM ↔ XRPL)
 */

const xrpl = require("xrpl");
const sentinel = require("./outlierSentinel.cjs");
const advisor = require("./twinsPolicyAdvisor.cjs");
const complianceBus = require("../../coinpurse/complianceInboxBus");
const { ingestXRPL } = require("./hybrid-governance-bridge");

// ENV
const ISSUER = process.env.XRPL_ISSUER;
const WSS = process.env.XRPL_WSS || "wss://s1.ripple.com";

// safety check
if (!ISSUER) {
    console.warn("⚠️ XRPL Governance Adapter: Missing XRPL_ISSUER");
}

// XRPL client
let client;

/* ──────────────────────────────────────────────
   CONNECT
────────────────────────────────────────────── */
async function connectXRPL() {
    try {
        client = new xrpl.Client(WSS);
        await client.connect();

        console.log(`🟢 XRPL Governance Adapter connected → ${WSS}`);
        subscribe();
    } catch (err) {
        console.error("❌ XRPL Governance Adapter connection failed:", err.message);
        setTimeout(connectXRPL, 5000);
    }
}

/* ──────────────────────────────────────────────
   SUBSCRIBE TO GOVERNANCE-RELEVANT STREAMS
────────────────────────────────────────────── */
async function subscribe() {
    try {
        await client.request({
            command: "subscribe",
            accounts: [ISSUER],
            streams: ["transactions", "ledger"],
        });

        console.log("🟣 XRPL Governance: Subscribed to issuer events.");
        client.on("transaction", handleTxn);
    } catch (err) {
        console.error("❌ Subscription Error:", err.message);
    }
}

/* ──────────────────────────────────────────────
   EVENT NORMALIZER (THE HEART OF XRPL GOVERNANCE)
────────────────────────────────────────────── */
async function handleTxn(event) {
    // We only process validated tx
    if (!event.validated) return;

    const txn = event.transaction;
    const meta = event.meta;

    // Only care about issuer account
    if (txn.Account !== ISSUER) return;

    const txType = txn.TransactionType;

    // Build unified governance packet
    const packet = {
        network: "XRPL",
        issuer: ISSUER,
        type: txType,
        txHash: txn.hash,
        timestamp: new Date().toISOString(),
        payload: txn,
        meta,
    };

    console.log(`⚡ XRPL Governance Event → ${txType}`);

    /* ──────────────────────────────────────────────
       SENTINEL RISK EVALUATION
    ─────────────────────────────────────────────── */
    const risk = await sentinel.evaluateImpact(
        {
            network: "XRPL",
            event: txType,
            amount: txn.Amount || null,
            issuer: ISSUER,
            raw: txn,
        },
        []
    );

    packet.risk = risk;

    /* ──────────────────────────────────────────────
       POLICY ADVISOR (AURA Twins)
    ─────────────────────────────────────────────── */
    const advisory = await advisor.generateAdvisory({
        network: "XRPL",
        event: txType,
        risk,
        txHash: txn.hash,
        issuer: ISSUER,
    });

    packet.advisory = advisory;

    /* ──────────────────────────────────────────────
       COMPLIANCE INBOX
    ─────────────────────────────────────────────── */
    complianceBus.push({
        source: "XRPL",
        event: packet,
        advisory,
    });

    /* ──────────────────────────────────────────────
       SOCKET BROADCAST → Admin Governance Panel
    ─────────────────────────────────────────────── */
    if (global.io) {
        global.io.emit("xrpl:governance:event", {
            event: packet,
            advisory,
        });
    }

    /* ──────────────────────────────────────────────
       FEED HYBRID C4 BRIDGE
       EVM ↔ XRPL synchronization for governance
    ─────────────────────────────────────────────── */
    ingestXRPL({
        event: txType,
        issuer: ISSUER,
        txHash: txn.hash,
        risk,
        advisory,
        raw: txn,
        timestamp: packet.timestamp,
    });
}

/* ──────────────────────────────────────────────
   STARTER
────────────────────────────────────────────── */
async function startXRPLGovernanceAdapter() {
    console.log("🚀 Starting XRPL Governance Adapter (Tier-1 C4 Mode)...");
    await connectXRPL();
}

module.exports = { startXRPLGovernanceAdapter };
