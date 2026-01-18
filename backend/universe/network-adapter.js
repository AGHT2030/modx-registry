
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

// © 2025 AIMAL Global Holdings
// 🌐 Universe Gateway Network Adapter (XRPL → EVM → MODLINK → UGW PQC Router)
// -----------------------------------------------------------------------------
// Purpose:
//   Convert ALL inbound governance-related events
//   into PQC envelopes → deliver them to the Universe Gateway v2.
//
// Works with:
//   - XRPL Governance Listener
//   - EVM Governance Listener
//   - MODLINK Core Hybrid Bridge (local events)
//   - MODX Galaxy Engine
//   - MODUSD / INTI / MODUSDs PoR subsystem
//   - CoinPurse Compliance
//
// Every adapter call produces:
//   PQCEnvelope = pqcWrap(type, payload)
//
// And routes to:
//   ingestPQCEnvelope(PQCEnvelope)
// -----------------------------------------------------------------------------

const { pqcWrapEnvelope } = require("../pqc/pqc-envelope.js");
const { ingestPQCEnvelope } = require("./universe-gateway.js");

/* =============================================================================
   🔄 SHARED ADAPTER: Core function for all inbound events
============================================================================= */
async function forwardToUGW(type, payload) {
    try {
        // 1. Wrap into PQC-secured envelope
        const envelope = pqcWrapEnvelope(type, payload);

        // 2. Send into Universe Gateway v2
        await ingestPQCEnvelope(envelope);

        return envelope;
    } catch (err) {
        console.error(`❌ NetworkAdapter failed for ${type}:`, err.message);
        return null;
    }
}

/* =============================================================================
   🟣 XRPL → UGW
============================================================================= */
async function xrplGovernanceEvent(evt) {
    return await forwardToUGW("GOV_EVENT", {
        chain: "XRPL",
        ...evt
    });
}

/* =============================================================================
   🟦 EVM → UGW
============================================================================= */
async function evmGovernanceEvent(evt) {
    return await forwardToUGW("GOV_EVENT", {
        chain: "EVM",
        ...evt
    });
}

/* =============================================================================
   🟡 MODLINK DAO → UGW
============================================================================= */
async function modlinkDAOEvent(evt) {
    return await forwardToUGW("DAO_EVENT", {
        chain: "MODLINK",
        ...evt
    });
}

/* =============================================================================
   🌌 MODX Galaxy Engine → UGW
============================================================================= */
async function modxGalaxyEvent(evt) {
    return await forwardToUGW("GOV_EVENT", {
        chain: "MODX",
        ...evt
    });
}

/* =============================================================================
   💠 ZK Proofs → UGW
============================================================================= */
async function zkProofEvent(proof) {
    return await forwardToUGW("ZK_PROOF", proof);
}

/* =============================================================================
   🪙 Proof-of-Reserves → UGW
   (MODUSDs, MODUSD, INTI)
============================================================================= */
async function porStatusUpdate(status) {
    return await forwardToUGW("POR_STATUS", status);
}

/* =============================================================================
   📨 Compliance Inbox → UGW
============================================================================= */
async function complianceUpdate(update) {
    return await forwardToUGW("COMPLIANCE", update);
}

/* =============================================================================
   EXPORTS
============================================================================= */
module.exports = {
    forwardToUGW,

    xrplGovernanceEvent,
    evmGovernanceEvent,
    modlinkDAOEvent,
    modxGalaxyEvent,

    porStatusUpdate,
    zkProofEvent,

    complianceUpdate
};
