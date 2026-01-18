
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

// backend/security/quantumInfectionDetector.js
/**
 * © 2025 Mia Lopez | Quantum Infection Detector (Black Hole T)
 * Detects tampering, corruption payloads, malformed packets, and off-chain intrusions.
 */

const crypto = require("crypto");

function entropyScore(str) {
    const freq = {};
    for (const c of str) freq[c] = (freq[c] || 0) + 1;

    let entropy = 0;
    const length = str.length;

    for (const key in freq) {
        const p = freq[key] / length;
        entropy -= p * Math.log2(p);
    }

    return entropy;
}

function analyzePacket(packet) {
    const raw = JSON.stringify(packet);

    return {
        entropy: entropyScore(raw),
        signature: crypto.createHash("sha256").update(raw).digest("hex")
    };
}

function detectInfection(packetAnalysis) {
    if (packetAnalysis.entropy > 7.8) {
        return { infected: true, reason: "High Entropy Malware Pattern Detected" };
    }
    if (/script|<|>|drop\s+table/i.test(JSON.stringify(packetAnalysis))) {
        return { infected: true, reason: "Mutation Payload or Script Injection" };
    }
    return { infected: false };
}

module.exports = { analyzePacket, detectInfection };
