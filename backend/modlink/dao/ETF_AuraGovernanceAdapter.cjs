// © 2025 AIMAL Global Holdings | AURA Governance Adapter
// Provides AURA Twin intelligence for MLA governance events.

module.exports = {

    runPreImpactAnalysis(payload) {
        global.AURA?.twins?.update("governance_preimpact", payload);
    },

    runAnalysis(payload) {
        global.AURA?.twins?.update("governance_analysis", payload);
    },

    runPostImpactAnalysis(payload) {
        global.AURA?.twins?.update("governance_postimpact", payload);
    }
};
