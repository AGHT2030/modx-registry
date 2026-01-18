
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

// © 2025 AIMAL Global Holdings | Severity Trend Model

function generateTrend(events = []) {
    const trend = {};

    events.forEach(evt => {
        const date = new Date(evt.timestamp).toISOString().slice(0, 10);

        if (!trend[date]) {
            trend[date] = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        }

        if (evt.threat && evt.threat.level) {
            trend[date][evt.threat.level]++;
        }
    });

    // Convert to list for charts
    return Object.entries(trend).map(([day, levels]) => ({
        day,
        ...levels
    }));
}

module.exports = { generateTrend };
