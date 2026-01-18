
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

// Provides personality fingerprint for each twin
exports.getPersonalityProfile = function (twin = "Agador") {
    const profiles = {
        Agador: { humor: 0.8, logic: 0.6, empathy: 0.9, curiosity: 1.0 },
        Ari: { humor: 0.7, logic: 0.9, empathy: 0.8, creativity: 0.95 },
    };
    return profiles[twin] || profiles.Ari;
};
