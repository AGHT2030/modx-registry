// © 2025 AIMAL Global Holdings | Governance Binding Engine
// Extended MLA Meta-Event Model (Preflight → Analysis → Timelock → Execute → Audit → Archive)

const registry = require("./ETF_GovernanceRegistry.cjs");
const handlers = require("./ETF_ActionHandlers.cjs");
const audit = require("./ETF_PQCAuditLogger.cjs");
const aura = require("./ETF_AuraGovernanceAdapter.cjs");
const GOVBUS = require("../../governance/GovernanceBus.cjs");

function safeInvoke(actionId, payload) {
    if (!handlers[actionId]) {
        console.error("❌ No handler for MLA Action:", actionId);
        return;
    }
    return handlers[actionId](payload);
}

// PRE-FLIGHT → risk simulation
GOVBUS.on("proposal:preflight", async (payload) => {
    aura.runPreImpactAnalysis(payload);
    audit.log("PREIMPACT", payload);
});

// ANALYSIS → AURA + Sentinel scoring
GOVBUS.on("proposal:analysis", async (payload) => {
    aura.runAnalysis(payload);
    audit.log("ANALYSIS", payload);
});

// QUEUED → enter timelock
GOVBUS.on("proposal:queued", async (payload) => {
    audit.log("QUEUED", payload);
});

// EXECUTE → run the handler
GOVBUS.on("proposal:execute", async (payload) => {
    audit.log("EXECUTE", payload);
    await safeInvoke(payload.action, payload);
});

// EXECUTED → post impact evaluation
GOVBUS.on("proposal:executed", async (payload) => {
    aura.runPostImpactAnalysis(payload);
    audit.log("POSTEXECUTION", payload);
});

// ARCHIVE → finalize audit
GOVBUS.on("proposal:archive", async (payload) => {
    audit.log("ARCHIVE", payload);
});

module.exports = {};
