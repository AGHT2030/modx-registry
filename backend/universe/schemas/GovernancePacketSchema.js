
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
 * © 2025 Mia Lopez | MODX Universe Gateway Governance Schema
 * -------------------------------------------------------------------------
 * This file defines the canonical governance packet structure for ALL chains.
 *
 * All Tier-5 engines (XRPL + EVM) → Unified Router → MUST conform to this schema
 * before entering:
 *   ✓ PQC Envelope Sealing
 *   ✓ MODLINK Galaxy Bridge
 *   ✓ Universe Gateway Checkpoint
 *   ✓ C5 Threat Engine
 *   ✓ Sentinel Policy Enforcement
 *   ✓ Advisor Intelligence
 *   ✓ Compliance Inbox
 */

module.exports.GovernancePacketSchema = {

    /* ============================================================
       🔵 CORE FIELDS
       Applies to all governance events (XRPL + EVM)
    ============================================================ */
    xcgid: "string",    // Cross-Chain Governance ID
    chain: "string",    // "XRPL" | "EVM" | "SIDECHAIN"
    type: "string",    // TransactionType or GovernanceType
    category: "string",    // "erc20", "governance", "nft", "amm", etc.
    hash: "string",    // Ledger hash or tx hash
    timestamp: "number",    // Event occurrence time (UTC epoch)

    /* ============================================================
       📊 LEDGER DETAILS
    ============================================================ */
    ledgerIndex: "number|null",
    blockNumber: "number|null",
    account: "string|null",
    destination: "string|null",

    /* ============================================================
       🪙 TOKEN/EVENT METADATA (optional depending on event type)
    ============================================================ */
    token: {
        currency: "string|null",
        issuer: "string|null",
        amount: "string|null"
    },

    /* ============================================================
       🎨 NFT METADATA
    ============================================================ */
    nft: {
        id: "string|null",
        action: "string|null",
        uri: "string|null",
        flags: "number|null",
        amount: "string|null"
    },

    /* ============================================================
       💧 AMM METADATA
    ============================================================ */
    amm: {
        action: "string|null",
        asset1: "string|null",
        asset2: "string|null",
        lpTokens: "string|null",
        tradingFee: "number|null"
    },

    /* ============================================================
       💱 DEX METADATA
    ============================================================ */
    dex: {
        action: "string|null",
        pays: "object|null",
        gets: "object|null",
        flags: "number|null"
    },

    /* ============================================================
       🔧 HOOKS METADATA
    ============================================================ */
    hooks: {
        executions: "array|null"  // Hook execution objects
    },

    /* ============================================================
       🔥 SECURITY — PROCESSING LAYERS
    ============================================================ */
    threat: {
        level: "string",  // low/medium/high/critical
        anomalyScore: "number",
        confidence: "number"
    },

    sentinel: {
        allowed: "boolean",
        violations: "array",
        actions: "array"
    },

    advisory: {
        recommendation: "string",
        urgency: "string",
        notes: "string"
    },

    /* ============================================================
       🌌 MODLINK → GALAXY ROUTING
    ============================================================ */
    galaxy: {
        id: "string",  // e.g. C3
        orbit: "string",  // e.g. C3-17
        lane: "string",  // e.g. "gov.core"
        checksum: "string"   // internal routing digest
    },

    /* ============================================================
       🛡 PQC ENVELOPE (WHAT THE GATEWAY SEALS)
    ============================================================ */
    pqcEnvelope: {
        signature: "string",  // Dilithium signature
        publicKey: "string",  // PQC public key
        blockHash: "string",  // Gateway-level block context
        sealedAt: "number"   // Time of PQC sealing
    },

    /* ============================================================
       📁 INTERNAL CONTROL
    ============================================================ */
    version: "string",   // e.g. "1.0.0"
    gatewayOrigin: "string"    // e.g. "MODX-Universe-G1"
};
