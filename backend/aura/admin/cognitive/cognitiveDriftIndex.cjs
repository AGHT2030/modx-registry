
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

// © 2025 AIMAL Global Holdings | Cognitive Drift Index (CommonJS)
function calculateCognitiveDrift(emotionAri, emotionAgador) {
    if (!emotionAri || !emotionAgador) return { driftIndex: 0, alignment: 100 };

    const normalize = (v) => {
        if (typeof v === "number") return Math.min(1, Math.max(0, v / 100));
        const map = {
            happy: 0.9, calm: 0.8, neutral: 0.5,
            tense: 0.3, sad: 0.2, angry: 0.1,
        };
        return map[v?.toLowerCase?.()] ?? 0.5;
    };

    const a = normalize(emotionAri);
    const b = normalize(emotionAgador);
    const diff = Math.abs(a - b);
    const alignment = Math.max(0, 1 - diff);

    return {
        driftIndex: Number(diff.toFixed(3)),
        alignment: Number((alignment * 100).toFixed(2)),
        divergence: Number((diff * 100).toFixed(2)),
    };
}

module.exports = { calculateCognitiveDrift };
