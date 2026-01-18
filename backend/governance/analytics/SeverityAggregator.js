
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

// © 2025 AIMAL Global Holdings | Severity Aggregator (24h Heatmap)
// Builds hourly severity buckets for Tier-5 governance events.

const HOURS = 24;

// Initialize empty heatmap
let heatmap = Array.from({ length: HOURS }, (_, h) => ({
    hour: h,
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
}));

function recordSeverity(evt) {
    if (!evt || !evt.threat || !evt.threat.level) return;

    const level = evt.threat.level;
    const hour = new Date(evt.timestamp || Date.now()).getHours();

    if (!heatmap[hour]) return;

    // Increment bucket
    heatmap[hour][level] = (heatmap[hour][level] || 0) + 1;

    return heatmap;
}

function getHeatmap() {
    return heatmap;
}

module.exports = { recordSeverity, getHeatmap };
