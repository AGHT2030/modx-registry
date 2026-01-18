
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

// © 2025 AIMAL Global Holdings | Heatmap + Time-Decay Test

console.log("🔥 Running Heatmap + Time-Decay Test...\n");

const { recordSeverity, getHeatmap } = require("../governance/analytics/SeverityAggregator");
const { generateDecayCurve } = require("../governance/analytics/TimeDecayModel");
const { generateTrend } = require("../governance/analytics/SeverityTrendModel");

// Generate synthetic Tier-5 events
const sampleEvents = [];

const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

for (let i = 0; i < 50; i++) {
    const level = levels[Math.floor(Math.random() * 4)];

    const evt = {
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        threat: { level },
        chain: Math.random() > 0.5 ? "XRPL" : "EVM",
        type: "TEST_EVENT"
    };

    sampleEvents.push(evt);
    recordSeverity(evt);
}

const heatmap = getHeatmap();
const decay = generateDecayCurve(sampleEvents);
const trend = generateTrend(sampleEvents);

console.log("✅ Heatmap (24h):");
console.log(heatmap);

console.log("\n✅ Time-Decay Prediction:");
console.log(decay);

console.log("\n✅ Multi-Day Trend:");
console.log(trend);

console.log("\n🎉 Heatmap + Time-Decay Test Complete!");
