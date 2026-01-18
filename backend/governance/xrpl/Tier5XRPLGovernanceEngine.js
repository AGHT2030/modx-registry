
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
 * © 2025 Mia Lopez | MODX XRPL Tier-5 Unified Governance Engine
 * ------------------------------------------------------------------
 * This is the highest-level XRPL governance module in the MODX stack.
 *
 * Includes:
 *   ✓ PQC Envelope Sealing
 *   ✓ MODLINK Galaxy Routing
 *   ✓ Universe Gateway Delivery
 *   ✓ C5 Threat Intelligence
 *   ✓ Sentinel Policy Enforcement
 *   ✓ Policy Advisor Emission
 *   ✓ Compliance Inbox Ingestion
 *   ✓ Frontend Emitters for Dashboards
 *   ✓ NFT + AMM + Hook v3 Governance
 *   ✓ Trustline + DEX Governance
 *   ✓ Multi-Issuer + Multi-Token Support
 *   ✓ Auto-Reconnect + Replay Protection
 */

const xrpl = require("xrpl");
const io = require("../../aura/aura-spectrum"); // AURA realtime bus

// PQC + Routing Layers
const { xrplGovernanceEvent } = require("../../universe/network-adapter");
const { C5Classify } = require("../../security/C5ThreatEngine");
const { sentinelEvaluate } = require("../../sentinel/SentinelCore");
const { policyAdvise } = require("../../policy/AdvisorCore");
const { inboxStore } = require("../../compliance/InboxStore");
const { auditLog } = require("../../admin/auditLogEngine");

// ENV
const ISSUERS = (process.env.XRPL_ISSUER_ADDRESSES || "").split(",").filter(Boolean);
const TOKENS = (process.env.XRPL_GOV_TOKENS || "").split(",").filter(Boolean);

const XRPL_NODE = process.env.XRPL_WSS || "wss://s1.ripple.com";

// XRPL Client
let client = null;
let reconnectTimer = null;

// Replay Protection
let seen = new Set();
function mark(hash) {
    if (!hash) return false;
    if (seen.has(hash)) return true;
    seen.add(hash);
    if (seen.size > 10000) seen.clear();
    return false;
}

/* ============================================================
   🧩 Extractors (Token / NFT / AMM / DEX / Hooks)
============================================================ */
function tokenOf(tx) {
    return (
        tx?.LimitAmount?.currency ||
        tx?.Amount?.currency ||
        tx?.TakerGets?.currency ||
        tx?.TakerPays?.currency ||
        null
    );
}

function extractNFT(tx) {
    if (!tx.TransactionType.startsWith("NFToken")) return null;
    return {
        action: tx.TransactionType,
        id: tx.NFTokenID,
        offer: tx.NFTokenOffer,
        uri: tx.URI ? Buffer.from(tx.URI, "hex").toString() : null,
        amount: tx.Amount || null,
        flags: tx.Flags
    };
}

function extractAMM(tx) {
    const t = tx.TransactionType;
    if (!["AMMCreate", "AMMDeposit", "AMMWithdraw", "AMMVote"].includes(t)) return null;
    return {
        action: t,
        asset1: tx.Amount?.currency || null,
        asset2: tx.Amount2?.currency || null,
        tradingFee: tx.TradingFee,
        lpTokens: tx.LPTokens
    };
}

function extractDEX(tx) {
    if (!["OfferCreate", "OfferCancel"].includes(tx.TransactionType)) return null;
    return {
        action: tx.TransactionType,
        pays: tx.TakerPays,
        gets: tx.TakerGets,
        flags: tx.Flags
    };
}

function extractHook(meta) {
    if (!meta?.HookExecutions) return null;
    return meta.HookExecutions.map(h => ({
        hook: h.HookHash,
        namespace: h.Namespace,
        account: h.Account,
        returnCode: h.ReturnCode
    }));
}

/* ============================================================
   🧠 MAIN EVENT PROCESSOR
============================================================ */
async function processEvent(ev) {
    try {
        const tx = ev?.transaction || {};
        const meta = ev?.meta || {};
        const hash = tx.hash;

        if (!hash || mark(hash)) return;

        // Does it touch ANY issuer?
        const touchesIssuer =
            ISSUERS.some(i => JSON.stringify(tx).includes(i));

        if (!touchesIssuer) return;

        // Core payload
        const payload = {
            chain: "XRPL",
            category: "governance",
            type: tx.TransactionType,
            hash,
            ledger: tx.ledger_index,
            account: tx.Account,
            destination: tx.Destination,
            token: tokenOf(tx),
            amm: extractAMM(tx),
            nft: extractNFT(tx),
            dex: extractDEX(tx),
            hooks: extractHook(meta),
            timestamp: Date.now(),
        };

        console.log("⚡ XRPL Tier-5 Governance Event:", payload);

        // ============================
        // 1) AUDIT LOG
        // ============================
        auditLog({
            severity: "HIGH",
            source: "XRPL Governance",
            message: `XRPL Governance Event: ${payload.type}`,
            details: payload
        });

        // ============================
        // 2) THREAT ANALYSIS (C5)
        // ============================
        const threat = C5Classify(payload);

        // ============================
        // 3) POLICY ENFORCEMENT
        // ============================
        const sentinel = sentinelEvaluate(payload);

        // ============================
        // 4) POLICY ADVISOR RECOMMENDATIONS
        // ============================
        const advisory = policyAdvise(payload, threat, sentinel);

        // ============================
        // 5) COMPLIANCE INBOX
        // ============================
        inboxStore({
            source: "XRPL",
            governance_type: payload.type,
            hash,
            data: payload
        });

        // ============================
        // 6) PQC + UNIVERSE GATEWAY (canonical backend path)
        // ============================
        await xrplGovernanceEvent({
            payload,
            threat,
            sentinel,
            advisory
        });

        // ============================
        // 7) FRONTEND EMITTERS (Option A)
        // ============================
        io.emit("xrpl:gov:event", {
            payload,
            threat,
            sentinel,
            advisory
        });

        if (payload.nft)
            io.emit("xrpl:gov:nft", payload);

        if (payload.amm)
            io.emit("xrpl:gov:amm", payload);

        if (payload.hooks && payload.hooks.length > 0)
            io.emit("xrpl:gov:hook", payload);

        if (payload.dex)
            io.emit("xrpl:gov:dex", payload);

        if (payload.token)
            io.emit("xrpl:gov:token", payload);

    } catch (err) {
        console.error("❌ XRPL Tier-5 Governance Error:", err);
    }
}

/* ============================================================
   🔄 SUBSCRIPTION + RECONNECT
============================================================ */
async function subscribeAll() {
    const streams = [
        "transactions",
        "ledger",
        "manifests",
        "validation",
        "peer_status",
        "consensus"
    ];

    for (const s of streams) {
        try {
            await client.request({
                command: "subscribe",
                streams: [s],
                accounts: ISSUERS
            });
        } catch (e) {
            console.warn(`⚠️ Failed to subscribe to ${s}:`, e.message);
        }
    }

    client.on("transaction", processEvent);

    console.log("📡 XRPL Tier-5 Governance Listener ACTIVE");
}

function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(connect, 5000);
    console.warn("↩️ XRPL reconnect scheduled in 5s...");
}

async function connect() {
    try {
        console.log(`🛰️ Connecting to XRPL: ${XRPL_NODE}`);
        client = new xrpl.Client(XRPL_NODE);
        await client.connect();
        console.log("✅ XRPL Connected");

        await subscribeAll();

    } catch (e) {
        console.error("❌ XRPL Connection Error:", e.message);
        scheduleReconnect();
    }
}

/* ============================================================
   🚀 AUTO-START
============================================================ */
connect();

module.exports = { connect };
