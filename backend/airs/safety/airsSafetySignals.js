/**
 * AIRS Safety Signals — Safe Stub
 * Tier-2 / Sovereign-lite compatible
 * Prevents hard crash when signals engine is not provisioned
 */

module.exports = {
    emit: () => { },
    evaluate: () => ({
        status: "safe",
        score: 0,
        signals: [],
        reason: "signals module not provisioned"
    }),
    register: () => { },
    list: () => []
};
