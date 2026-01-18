/**
 * © 2025 AIMAL Global Holdings | MODX Sovereign Governance
 * XRPL Trust Scoring Engine
 */

module.exports = function computeXRPLTrustScore(metrics = {}) {
    const {
        connected = false,
        latencyMs = 20000,
        errorRate = 1,
        degraded = false,
        timeouts = 0
    } = metrics;

    let score = 100;

    if (!connected) score -= 40;
    if (latencyMs > 15000) score -= 20;
    if (errorRate > 0.1) score -= 20;
    if (timeouts > 0) score -= 10;
    if (degraded) score -= 10;

    score = Math.max(0, score);

    // Global enforcement
    global.XRPL_TRUST_LEVEL = score;

    if (score < 50) {
        global.XRPL_READY = false;
        global.XRPL_DEGRADED = true;
    }

    return score;
};
