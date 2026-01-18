/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * GOVERNANCE LISTENER (LEGACY DISABLED)
 * ----------------------------------------------------
 * ❌ contract.on() is FORBIDDEN
 * ✅ Unified EVM Governance Listener ONLY
 * 🛡 Startup assertions + runtime filter detection enforced
 */

const path = require("path");
const { getProvider, ethers, isV5 } = require("../../utils/loadEthers");

// AURA Spectrum Bridge
const {
    emitPolicyAck,
    sendTwinVoiceFeedback,
} = require("../../modules/aura-spectrum.js");

// C5 Governance Ingestion
const c5 = require("../../routes/governance/c5Route");

/* ============================================================
   🛑 HARD ASSERTION — NO LEGACY FILTERS
============================================================ */

if (!global.__EVM_CONTRACT_ON_LOCKED__) {
    global.__EVM_CONTRACT_ON_LOCKED__ = true;

    const originalOn = ethers.Contract.prototype.on;

    ethers.Contract.prototype.on = function () {
        const err = new Error(
            "⛔ BLOCKED: contract.on() is forbidden — Unified Governance Listener required"
        );

        console.error(err.message);
        console.error("📍 Stack trace:\n", err.stack);

        // Fail FAST in dev / staging
        if (process.env.GOVERNANCE_STRICT_MODE !== "false") {
            throw err;
        }
    };

    console.log("🔒 GovernanceListener: contract.on() HARD-LOCKED");
}

/* ============================================================
   🛡 PROVIDER + FILTER DETECTOR
============================================================ */

const RPC_URL =
    process.env.POLYGON_RPC_URL ||
    process.env.RPC_URL ||
    "https://polygon-rpc.com";

let provider = null;

try {
    provider = getProvider(RPC_URL);
    console.log(
        `🔗 GovernanceListener: Provider loaded (${isV5 ? "v5" : "v6"}) → ${RPC_URL}`
    );
} catch (err) {
    console.error("❌ Provider init failed:", err.message);
}

/* ============================================================
   🧨 RUNTIME eth_newFilter DETECTOR
============================================================ */

if (provider && provider.send && !provider.__FILTER_GUARD__) {
    provider.__FILTER_GUARD__ = true;

    const originalSend = provider.send.bind(provider);

    provider.send = async (method, params) => {
        if (
            method === "eth_newFilter" ||
            method === "eth_newBlockFilter" ||
            method === "eth_newPendingTransactionFilter"
        ) {
            const err = new Error(`🚨 eth_newFilter DETECTED: ${method}`);
            console.error(err.message);
            console.error("📍 Stack trace:\n", err.stack);

            // Optional hard-fail
            if (process.env.EVM_FILTER_STRICT === "true") {
                throw err;
            }
        }

        return originalSend(method, params);
    };

    console.log("🛡 GovernanceListener: eth_newFilter runtime detector armed");
}

/* ============================================================
   🧩 SAFE C5 INGEST
============================================================ */

async function safeC5Ingest(event) {
    try {
        if (!event) return;
        await c5.ingest(event);
    } catch (err) {
        console.warn("⚠️ c5.ingest error:", err.message);
    }
}

/* ============================================================
   🚫 LEGACY WATCHERS DISABLED
============================================================ */

function initGovernanceListener() {
    console.warn(
        "⛔ Legacy governance-listener DISABLED — using Unified EVM Governance Listener only"
    );
}

/* ============================================================
   🚀 INIT
============================================================ */

initGovernanceListener();

module.exports = {
    initGovernanceListener,
    safeC5Ingest,
};
