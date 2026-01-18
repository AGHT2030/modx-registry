
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
 * © 2025 Mia Lopez | XRPL Governance Listener (Tier-1 C3 Mode → PQC Adapter Mode)
 *
 * NEW (2025 PQC Update):
 *   ✔ Removes legacy direct routes (Sentinel, Advisor, C5, Inbox, C4)
 *   ✔ Every XRPL governance event now routes → PQC Envelope Layer
 *   ✔ All chains enter MODX Universe Gateway through one adapter
 *   ✔ Includes audit logging + metadata extraction + reconnect logic
 */

const xrpl = require("xrpl");

// ⭐ New PQC Network Adapter
const { xrplGovernanceEvent } = require("../../universe/network-adapter.js");

// ⭐ Audit Logging Engine
const { auditLog } = require("../../admin/auditLogEngine");

// ENV
const ISSUER = process.env.XRPL_ISSUER_ADDRESS || "";
const TOKENS = (process.env.XRPL_TOKENS || "").split(",");

// XRPL NODE
const XRPL_NODE = process.env.XRPL_WSS || "wss://s1.ripple.com";

// GLOBAL
let client = null;
let reconnectTimer = null;

/* ============================================================
   🧩 TOKEN EXTRACTOR
============================================================ */
function extractTokenFromTX(tx) {
    if (tx?.LimitAmount?.currency) return tx.LimitAmount.currency;
    if (tx?.Amount?.currency) return tx.Amount.currency;
    if (tx?.TakerGets?.currency) return tx.TakerGets.currency;
    if (tx?.TakerPays?.currency) return tx.TakerPays.currency;
    return null;
}

/* ============================================================
   🧩 AMM Metadata
============================================================ */
function extractAMMMetadata(tx) {
    const t = tx.TransactionType;
    if (!["AMMCreate", "AMMDeposit", "AMMWithdraw", "AMMVote"].includes(t)) return null;

    return {
        action: t,
        amount: tx.Amount || null,
        asset1: tx.Amount?.currency || null,
        asset2: tx.Amount2?.currency || null,
        tradingFee: tx.TradingFee,
        lpTokens: tx.LPTokens
    };
}

/* ============================================================
   🎨 NFT Metadata
============================================================ */
function extractNFTMetadata(tx) {
    if (!tx.TransactionType.startsWith("NFToken")) return null;

    return {
        action: tx.TransactionType,
        tokenId: tx.NFTokenID,
        amount: tx.Amount,
        uri: tx.URI ? Buffer.from(tx.URI, "hex").toString() : null,
        flags: tx.Flags
    };
}

/* ============================================================
   💱 DEX Metadata
============================================================ */
function extractDEXMetadata(tx) {
    if (!["OfferCreate", "OfferCancel"].includes(tx.TransactionType)) return null;

    return {
        action: tx.TransactionType,
        pays: tx.TakerPays,
        gets: tx.TakerGets,
        flags: tx.Flags
    };
}

/* ============================================================
   🧠 EVENT PROCESSOR (NEW → PQC Adapter Mode)
============================================================ */
async function handleXRPLEvent(event) {
    try {
        const tx = event?.transaction || {};
        const meta = event?.meta;

        // Only process events related to ISSUER account
        const touchesIssuer =
            tx.Account === ISSUER ||
            tx.Destination === ISSUER ||
            JSON.stringify(tx).includes(ISSUER);

        if (!touchesIssuer) return;

        const payload = {
            chain: "XRPL",
            type: tx.TransactionType,
            hash: tx.hash,
            account: tx.Account,
            destination: tx.Destination,
            meta,
            token: extractTokenFromTX(tx),
            amm: extractAMMMetadata(tx),
            nft: extractNFTMetadata(tx),
            dex: extractDEXMetadata(tx),
            timestamp: new Date().toISOString()
        };

        console.log("⚡ XRPL Governance Event:", payload);

        /* =======================================================
           ⭐ AUDIT LOG — REQUIRED
        ======================================================= */
        auditLog({
            severity: "HIGH",
            source: "XRPL Governance",
            message: `XRPL event detected: ${payload.type}`,
            details: payload
        });

        /* =======================================================
           ⭐ NEW: Route → PQC Universe Adapter (Step G)
             All downstream routing happens automatically:
              → Sentinel
              → C5 Threat Engine
              → Policy Advisor
              → Compliance Inbox
              → MODLINK Galaxy Bridge
              → Universe Gateway
              → PQC Sealing
              → Frontend Dashboards
        ======================================================= */
        await xrplGovernanceEvent(payload);

    } catch (err) {
        console.error("❌ XRPL event processor failure:", err.message);
    }
}

/* ============================================================
   🌐 SUBSCRIPTION + WATCH
============================================================ */
async function subscribeEvents() {
    if (!client || !client.isConnected()) return;

    const streams = [
        "transactions",
        "ledger",
        "manifests",
        "validation",
        "peer_status",
        "consensus",
    ];

    for (const s of streams) {
        try {
            await client.request({
                command: "subscribe",
                streams: [s],
                accounts: [ISSUER]
            });
        } catch (err) {
            console.warn(`⚠️ Subscribe failed → ${s}:`, err.message);
        }
    }

    for (const token of TOKENS) {
        if (!token) continue;
        try {
            await client.request({
                command: "subscribe",
                accounts: [ISSUER],
                accounts_proposed: [ISSUER]
            });
        } catch (err) {
            console.warn("⚠️ TrustLine subscribe error:", err.message);
        }
    }

    client.on("transaction", handleXRPLEvent);
    client.on("disconnected", scheduleReconnect);

    console.log("📡 XRPL Governance Listener ACTIVE (PQC Adapter Mode)");
}

/* ============================================================
   🔁 AUTO-RECONNECT
============================================================ */
function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectXRPL();
    }, 5000);

    console.warn("↩️ XRPL reconnect scheduled in 5s.");
}
/* ============================================================
   🚀 CONNECT
============================================================ */
async function connectXRPL() {
    try {
        if (client && client.isConnected()) {
            console.log("🔗 XRPL Listener already active.");
            return;
        }

        console.log(`🛰️ Connecting to XRPL → ${XRPL_NODE}`);

        client = new xrpl.Client(XRPL_NODE, {
            connectionTimeout: 15000
        });

        await client.connect();

        // ✅ GLOBAL BIND — THIS IS THE MISSING LINK
        global.XRPL_CLIENT = client;

        console.log("✅ XRPL Governance Listener CONNECTED");
        console.log("🌍 XRPL client bound to global.XRPL_CLIENT");

        await client.request({
            command: "subscribe",
            accounts: [ISSUER],
            streams: ["ledger", "transactions"]
        });

        client.on("transaction", handleXRPLEvent);
        client.on("disconnected", scheduleReconnect);

    } catch (err) {
        console.error("❌ XRPL connection failed:", err.message);
        scheduleReconnect();
    }
}

/* ============================================================
   EXPORT + AUTO-START
============================================================ */
module.exports = { connectXRPL };
connectXRPL();
