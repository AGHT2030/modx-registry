
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

// © 2025 AIMAL Global Holdings | Time Decay Model
// Converts last N severity events into a decay curve (predictive risk model)

function generateDecayCurve(events = []) {
    const curve = [];

    // higher → more severe
    const severityWeights = {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 4,
        CRITICAL: 8
    };

    let current = 0;

    events.forEach(evt => {
        if (!evt.threat) return;
        const level = evt.threat.level;
        const impact = severityWeights[level] || 0;

        current += impact;
        // exponential decay: severity *= 0.90 each tick
        current *= 0.90;

        curve.push({
            t: curve.length,
            severity: Number(current.toFixed(2))
        });
    });

    return curve;
}

module.exports = { generateDecayCurve };
