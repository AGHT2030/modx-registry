
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
 * © 2025 Mia Lopez | MODLINK DAO Event Bridge (C4 → F2 Mode)
 * --------------------------------------------------------------------
 * Handles all inbound governance signals:
 *   XRPL • EVM • MODX • MODLINK • Sentinel • C5 • Hybrid
 *
 * Normalizes → PQC seals → broadcasts → auto-registers new events.
 *
 * Feeds:
 *   • MODLINK.dao.emitGovernance
 *   • MODX Galaxy Hub
 *   • AURA Twins (real-time governance overlay)
 *   • C5 Threat Engine + Heatmap
 *   • Policy Advisor cognitive layer
 *   • CoinPurse compliance inbox
 *   • Trust PQC audit stream (Phase 8.2)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// PQC fallback wrapper (real PQC provided globally)
const PQC = global.PQC || {
    sign: (d) => ({ integrity: "none", timestamp: Date.now() }),
    verify: () => true
};

// Engines (loaded only if available — safe fail)
let sentinel = null;
let advisor = null;
let c5 = null;

try { sentinel = require("../modx/governance/outlierSentinel.cjs"); } catch { }
try { advisor = require("../modx/governance/twinsPolicyAdvisor.cjs"); } catch { }
try { c5 = require("../modx/governance/c5-threat-processor.cjs"); } catch { }

const REGISTRY_PATH = path.join(__dirname, "modlinkGovernance.json");

/* ====================================================================
   🔐 PQC Seal + SHA-256 Hash Normalizer
==================================================================== */
function sealEvent(evt) {
    const json = JSON.stringify(evt);
    const hash = crypto.createHash("sha256").update(json).digest("hex");

    return {
        ...evt,
        hash,
        pqc: PQC.sign(hash),
        sealedAt: new Date().toISOString()
    };
}

/* ====================================================================
   📕 Governance Registry Loader (Galaxies / Orbs / Clusters)
==================================================================== */
function loadRegistry() {
    try {
        if (!fs.existsSync(REGISTRY_PATH))
            return { galaxies: [] };

        return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    } catch {
        return { galaxies: [] };
    }
}

/* ====================================================================
   🧩 Governance Event Normalizer (C4 → MODLINK Unified Format)
==================================================================== */
function normalize(source, raw) {
    return {
        source,
        chain:
            source.includes("XRPL") ? "XRPL" :
                source.includes("EVM") ? "EVM" :
                    source.includes("C5") ? "C5" :
                        source.includes("Sentinel") ? "MODX" :
                            "MODLINK",

        type: raw.type || raw.event || "Unknown",
        token: raw.token || null,
        gov: raw.gov || null,

        block: raw.block || raw.blockNumber || null,
        ledger: raw.ledgerIndex || null,
        meta: raw.meta || raw.details || null,

        account: raw.account || raw.from || null,
        destination: raw.destination || raw.to || null,

        timestamp: raw.timestamp || new Date().toISOString(),
        raw
    };
}

/* ====================================================================
   🌐 Global Broadcast Pipeline
==================================================================== */
function broadcast(evt) {
    const sealed = sealEvent(evt);

    // 1 — MODLINK DAO governance sink
    if (global.MODLINK?.dao?.emitGovernance) {
        global.MODLINK.dao.emitGovernance(sealed);
    }

    // 2 — MODX Galaxy Event Hub
    if (global.MODX_GALAXY) {
        global.MODX_GALAXY.broadcast("modlink:governance:event", sealed);
    }

    // 3 — Real-time WebSocket layer (AURA Twins + dashboards)
    if (global.io) {
        global.io.emit("modlink:governance:event", sealed);
    }

    // 4 — CoinPurse compliance inbox
    if (global.COINPURSE_PUSH_INBOX) {
        global.COINPURSE_PUSH_INBOX({
            type: "modlink-governance",
            title: `Governance Event: ${sealed.type}`,
            body: `Chain: ${sealed.chain}`,
            severity: "info",
            event: sealed
        });
    }

    // 5 — PQC Trust Audit Log (Phase 8.2)
    if (global.TRUST_PQC_LOG) {
        try {
            global.TRUST_PQC_LOG("MODLINK_GOV_EVENT", sealed);
        } catch { }
    }

    console.log(`🔗 [MODLINK Event Bridge] ${sealed.chain} → ${sealed.type}`);

    return sealed;
}

/* ====================================================================
   🔥 C4 Ingestors (XRPL • EVM • MODX • MODLINK • C5 • Sentinel)
==================================================================== */
function ingestXRPL(raw) { return broadcast(normalize("XRPL_C3", raw)); }
function ingestEVM(raw) { return broadcast(normalize("EVM_C3", raw)); }
function ingestMODX(raw) { return broadcast(normalize("MODX_C3", raw)); }
function ingestMODLINK(raw) { return broadcast(normalize("MODLINK_F1", raw)); }
function ingestSentinel(raw) { return broadcast(normalize("Sentinel_C5", raw)); }
function ingestC5(raw) { return broadcast(normalize("C5_Threat", raw)); }

/* ====================================================================
   🪐 Auto-Registry → Galaxies (updates modlinkGovernance.json)
==================================================================== */
function autoRegister(evt) {
    const registry = loadRegistry();

    // Resolve the MODX main governance galaxy
    let galaxy = registry.galaxies.find(g => g.name === "MODX");
    if (!galaxy) {
        galaxy = { name: "MODX", orbs: [], updated: null };
        registry.galaxies.push(galaxy);
    }

    // Add orb for unseen governance event type
    const exists = galaxy.orbs.find(o => o.event === evt.type);

    if (!exists) {
        galaxy.orbs.push({
            event: evt.type,
            chain: evt.chain,
            lastSeen: evt.timestamp
        });

        galaxy.updated = new Date().toISOString();

        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
        console.log(`🪐 [Auto-Registry] Added orb → ${evt.type}`);
    }
}

/* ====================================================================
   MAIN HYBRID INGEST (C4 → MODLINK)
==================================================================== */
function ingestHybrid(raw) {
    const evt = normalize("Hybrid_C4", raw);
    const sealed = broadcast(evt);

    autoRegister(sealed);

    // Forward to C5 engine (optional)
    if (c5?.processC5) {
        c5.processC5({
            chain: evt.chain,
            type: evt.type,
            token: evt.token,
            gov: evt.gov,
            timestamp: evt.timestamp
        });
    }

    return sealed;
}

/* ====================================================================
   EXPORTS
==================================================================== */
module.exports = {
    ingestXRPL,
    ingestEVM,
    ingestMODX,
    ingestMODLINK,
    ingestSentinel,
    ingestC5,
    ingestHybrid,
    broadcast
};
