
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

// © 2025 AIMAL Global Holdings | AURA Empathy Weights
exports.getEmpathyWeights = function (ariEmotion, agadorEmotion) {
    const base = {
        calm: 0.9, focused: 0.8, creative: 0.7, analytical: 0.6,
        humorous: 0.85, empathetic: 1.0, neutral: 0.5,
    };
    const a = base[ariEmotion] || 0.5;
    const b = base[agadorEmotion] || 0.5;
    return ((a + b) / 2).toFixed(2);
};
