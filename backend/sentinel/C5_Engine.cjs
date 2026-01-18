/**
 * Sentinel C5 Threat Engine
 * Correlates events across:
 *  - AURA Drift
 *  - Fingerprint anomalies
 *  - Governance spikes
 *  - Unauthorized attempts
 */

module.exports = {
    evaluate(input) {
        const { drift, fpMatch, unauthorized, govEvents } = input;
        let risk = 0;

        if (drift === "ANOMALY") risk += 2;
        if (drift === "ABSENT") risk += 3;

        if (fpMatch === "ANOMALY") risk += 2;
        if (unauthorized > 0) risk += unauthorized;
        if (govEvents > 5) risk += 1;

        if (risk >= 6) return "CRITICAL";
        if (risk >= 3) return "HIGH";
        if (risk >= 1) return "ELEVATED";
        return "NORMAL";
    }
};
