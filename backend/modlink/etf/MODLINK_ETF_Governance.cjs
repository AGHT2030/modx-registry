/**
 * © 2025–2026 AG Holdings Trust | MODLINK ETF Governance Binding
 * -------------------------------------------------------------
 * Registers all MODX ETFs into MODLINK DAO governance system.
 * Provides upgrade paths, parameter sync, AURA Twin advisories,
 * PQC alerts, and Constitution-level oversight hooks.
 *
 * Runtime-Safe:
 * - No hard dependency on AURA UI
 * - No crash if sockets are unavailable
 * - Sovereign Tier-2 compatible
 */

"use strict";

// --------------------------------------------------
// ETF BRIDGE (REQUIRED)
// --------------------------------------------------
const ETFBridge = require("../../etf/ETF_Bridge.cjs");

// --------------------------------------------------
// 🧠 OPTIONAL AURA SOCKET (RUNTIME SAFE)
// --------------------------------------------------
let io = null;
try {
    const aura = require("../../aura/aura-spectrum.js");
    io = aura?.io || null;
} catch (_) {
    // Sovereign mode: UI / sockets not present
    io = null;
}

// --------------------------------------------------
// MAIN GOVERNANCE REGISTRATION
// --------------------------------------------------
module.exports = function registerETFGovernance(modlink) {
    if (!modlink || typeof modlink.registerGovernanceModule !== "function") {
        console.warn("⚠ MODLINK ETF Governance: Invalid modlink instance.");
        return;
    }

    const etfs = ETFBridge.getAddresses();

    if (!etfs || Object.keys(etfs).length === 0) {
        console.warn("⚠ MODLINK ETF Governance: No ETF deployments found.");
        return;
    }

    console.log("🏛 Registering ETFs into MODLINK Governance…");

    // ---------------------------------------------------------
    // 🧩 1. Register ETFs as DAO-governed financial instruments
    // ---------------------------------------------------------
    for (const [name, address] of Object.entries(etfs)) {
        try {
            modlink.registerGovernanceModule({
                module: name,
                address,
                type: "ETF",
                upgradable: true,
                constitutionScope: "FINANCIAL_INSTRUMENT"
            });

            console.log(`   • ETF registered: ${name} @ ${address}`);
        } catch (err) {
            console.warn(`⚠ Failed to register ETF ${name}:`, err.message);
        }
    }

    // ---------------------------------------------------------
    // 🧩 2. Constitution-Level Policy Controls
    // ---------------------------------------------------------
    modlink.definePolicy?.("ETF_MINT_CONTROL", {
        requires: ["FINANCIAL_INSTRUMENT", "TREASURY_ACCESS"],
        description: "Controls authority over ETF minting operations."
    });

    modlink.definePolicy?.("ETF_BURN_CONTROL", {
        requires: ["FINANCIAL_INSTRUMENT"],
        description: "Controls authority over ETF burning operations."
    });

    modlink.definePolicy?.("ETF_REBALANCE", {
        requires: ["FINANCIAL_INSTRUMENT", "MARKET_RISK"],
        description: "Authority to rebalance ETF underlying assets."
    });

    // ---------------------------------------------------------
    // 🧩 3. Governance → ETF Update Bridge
    // ---------------------------------------------------------
    modlink.on?.("governance:update", (update) => {
        console.log("📡 MODLINK governance update → ETFs:", update);

        if (io) {
            try {
                io.emit("governance:etf:update", update);
            } catch (_) {
                // Socket failures do not affect governance
            }
        }
    });

    // ---------------------------------------------------------
    // 🧩 4. Optional ETF Activity Telemetry (UI + Twins)
    // ---------------------------------------------------------
    if (io) {
        io.on?.("etf:mint", (data) => {
            modlink.emit?.("etf:activity", { ...data, type: "MINT" });
        });

        io.on?.("etf:burn", (data) => {
            modlink.emit?.("etf:activity", { ...data, type: "BURN" });
        });
    }

    console.log("🏛 MODLINK ETF Governance Binding ACTIVE (Runtime-Safe).");
};
