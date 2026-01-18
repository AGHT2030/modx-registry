
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
// 🔭 MODX Universe Gateway v2 (PQC Router + Multi-Channel Dispatcher)
// -----------------------------------------------------------------------------
// Entry point for ALL PQC-sealed packets coming from:
//   - MODLINK Core Hybrid Bridge
//   - XRPL Governance Listener
//   - EVM Governance Listener
//   - MODX DAO / Galaxy
//   - CoinPurse Compliance Inbox
//   - ZK Engine
//   - MODUSD / INTI / MODUSDs PoR System
//
// Performs:
//   • PQC verification (Dilithium5 + Falcon512 hybrid)
//   • Replay prevention
//   • Multi-channel routing
//   • Galaxy rebroadcast
//   • Severity propagation
// -----------------------------------------------------------------------------


const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// PQC verification layer
const { pqcVerifyEnvelope } = require("../pqc/pqc-envelope.js");

// Log storage
const UGW_LOG = path.resolve("./backend/universe/logs/ugw-events.json");

// Replay cache
let REPLAY_CACHE = new Set();

// Keep last 2000 events
function writeLog(pkt) {
    try {
        const existing = fs.existsSync(UGW_LOG)
            ? JSON.parse(fs.readFileSync(UGW_LOG, "utf8"))
            : [];

        existing.push(pkt);
        fs.mkdirSync(path.dirname(UGW_LOG), { recursive: true });
        fs.writeFileSync(UGW_LOG, JSON.stringify(existing.slice(-2000), null, 2));
    } catch (err) {
        console.warn("⚠️ Failed UGW log write:", err.message);
    }
}

/* ============================================================================
   🔒 Replay Protection
============================================================================ */
function isReplay(packet) {
    const key = packet.meta?.combinedSig;
    if (!key) return false;

    if (REPLAY_CACHE.has(key)) return true;

    REPLAY_CACHE.add(key);

    // Keep replay cache small
    if (REPLAY_CACHE.size > 10000) {
        REPLAY_CACHE = new Set([...REPLAY_CACHE].slice(-5000));
    }

    return false;
}

/* ============================================================================
   🧭 Main Router
============================================================================ */
async function routePacket(packet) {
    if (!packet?.meta?.type) return;

    const type = packet.meta.type;
    const payload = packet.payload;

    // Write log (after PQC validation)
    writeLog(packet);

    // 1. Universe-wide socket broadcast
    if (global.io) {
        global.io.emit("ugw:packet", packet);
    }

    // 2. Galaxy distribution
    if (global.MODX_GALAXY) {
        global.MODX_GALAXY.broadcast("ugw:event", packet);
    }

    // 3. Channel routing
    switch (type) {
        case "GOV_EVENT":
            if (global.io)
                global.io.emit("governance:ugw:event", payload);

            if (global.COINPURSE_PUSH_INBOX) {
                global.COINPURSE_PUSH_INBOX({
                    type: "ugw-gov",
                    title: `Governance Event (${payload.chain})`,
                    body: payload.type,
                    severity: payload?.risk?.severity || "low"
                });
            }
            break;

        case "C5_SEVERITY":
            if (global.io)
                global.io.emit("c5:severity:update", payload);

            if (global.C5_ENGINE?.update)
                global.C5_ENGINE.update(payload);
            break;

        case "POR_STATUS":
            if (global.io)
                global.io.emit("por:update", payload);

            if (global.COINPURSE_PUSH_INBOX) {
                global.COINPURSE_PUSH_INBOX({
                    type: "por-update",
                    title: "Proof-of-Reserves Updated",
                    body: `Assets: ${payload.asset}`,
                    severity: "info"
                });
            }
            break;

        case "ZK_PROOF":
            if (global.io)
                global.io.emit("zk:proof", payload);
            break;

        case "DAO_EVENT":
            if (global.io)
                global.io.emit("dao:ugw", payload);

            if (global.MODLINK?.dao?.emitGovernance)
                global.MODLINK.dao.emitGovernance(payload);

            break;

        case "COMPLIANCE":
            if (global.COINPURSE_PUSH_INBOX)
                global.COINPURSE_PUSH_INBOX(payload);
            break;

        default:
            console.log("📦 [UGW] Unknown packet:", type);
    }
}

/* ============================================================================
   🚀 Main Universe Gateway Entry
============================================================================ */
async function ingestPQCEnvelope(packet) {
    try {
        // 1. Verify PQC Signatures
        const ok = pqcVerifyEnvelope(packet);
        if (!ok) {
            console.error("❌ UGW PQC Verification FAILED");
            return false;
        }

        // 2. Replay Prevention
        if (isReplay(packet)) {
            console.warn("⚠️ Replay prevented:", packet.meta.type);
            return false;
        }

        // 3. Dispatch
        await routePacket(packet);

        return true;
    } catch (err) {
        console.error("❌ Universe Gateway ingest error:", err.message);
        return false;
    }
}

/* ============================================================================
   EXPORTS
============================================================================ */
module.exports = {
    ingestPQCEnvelope
};
