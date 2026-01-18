
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

// ===============================================================
// © 2025 AIMAL Global Holdings | Cognitive Drift Index (CJS)
// ===============================================================
// Purpose:
//   • Calculates cognitive drift between AURA assistants (Ari & Agador)
//   • Used by auraMetricsEmitter.js to broadcast live sentiment drift
//
// Notes:
//   • CommonJS-safe for Node.js + PM2 environments
//   • Returns normalized drift values between 0 and 1
//
// ===============================================================

/**
 * Calculates cognitive drift between two emotional baselines.
 * @param {number} emotionAri - Value between 0 and 1 (Ari's sentiment)
 * @param {number} emotionAgador - Value between 0 and 1 (Agador's sentiment)
 * @returns {number} drift - Normalized drift value between 0 and 1
 */
function calculateCognitiveDrift(emotionAri = 0, emotionAgador = 0) {
    try {
        const delta = Math.abs(emotionAri - emotionAgador);
        const weighted = (delta * 1.2) / (1 + delta); // soft normalization
        const drift = Math.min(1, weighted);
        return drift;
    } catch (err) {
        console.error("❌ Cognitive Drift Calculation Error:", err.message);
        return 0;
    }
}

/**
 * Estimates emotional alignment (recovery potential) between AURA entities.
 * @param {Array} history - Array of previous drift values (each 0–1)
 * @returns {number} recovery - Normalized recovery potential (0–1)
 */
function estimateDriftRecovery(history = []) {
    if (!Array.isArray(history) || history.length === 0) return 1;
    const avgDrift = history.reduce((a, b) => a + (b.drift || 0), 0) / history.length;
    const recovery = Math.max(0, 1 - avgDrift);
    return recovery;
}

// ===============================================================
// 🔹 Optional advanced metrics
// ===============================================================

/**
 * Predicts drift stability trend based on historical variance.
 * @param {Array} history
 * @returns {object} { trend: 'stable' | 'volatile', variance: number }
 */
function analyzeDriftTrend(history = []) {
    if (history.length < 2) return { trend: "stable", variance: 0 };
    const diffs = history.slice(1).map((h, i) => Math.abs(h.drift - history[i].drift));
    const variance = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const trend = variance > 0.2 ? "volatile" : "stable";
    return { trend, variance: Number(variance.toFixed(3)) };
}

// ===============================================================
// 🔹 Exports (CommonJS)
// ===============================================================
module.exports = {
    calculateCognitiveDrift,
    estimateDriftRecovery,
    analyzeDriftTrend,
};


