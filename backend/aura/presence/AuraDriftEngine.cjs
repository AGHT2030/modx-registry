module.exports = function classifyDrift(metrics) {
    const { idleMs, cadenceScore, velocityScore } = metrics;

    if (idleMs > 120000) return "ABSENT";
    if (cadenceScore < 0.3 || velocityScore < 0.3) return "ANOMALY";
    return "NORMAL";
};
