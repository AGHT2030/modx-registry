/**
 * © 2025 AG Holdings Trust | AURA Trustee Identity Fingerprint (TIF)
 *
 * Builds & verifies a behavioral biometric signature for trustees.
 */

module.exports = {
    store: {},

    updateFingerprint(user, metrics) {
        if (!this.store[user.email]) {
            // Initialize fingerprint
            this.store[user.email] = {
                cadenceAvg: metrics.cadenceScore,
                entropy: 1 - metrics.cadenceScore,
                driftPattern: metrics.idleMs,
                lastUpdate: Date.now()
            };
            return;
        }

        const fp = this.store[user.email];

        // Weighted update model
        fp.cadenceAvg = (fp.cadenceAvg * 0.7) + (metrics.cadenceScore * 0.3);
        fp.entropy = (fp.entropy * 0.8) + ((1 - metrics.cadenceScore) * 0.2);
        fp.driftPattern = metrics.idleMs;

        fp.lastUpdate = Date.now();
    },

    verifyFingerprint(user, metrics) {
        const fp = this.store[user.email];
        if (!fp) return "UNKNOWN";

        let score = 1;

        // Drift penalty
        if (Math.abs(fp.driftPattern - metrics.idleMs) > 60000) score -= 0.3;

        // Cadence mismatch penalty
        if (Math.abs(fp.cadenceAvg - metrics.cadenceScore) > 0.4) score -= 0.5;

        // If score too low → anomaly
        if (score < 0.5) return "ANOMALY";
        return "MATCH";
    }
};
