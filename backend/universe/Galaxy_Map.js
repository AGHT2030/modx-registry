
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

// © 2025 AIMAL Global Holdings | Galaxy Map (CJS)

const GalaxyMap = {
    map: {
        excited: { name: "PLAY" },
        curious: { name: "LEARN" },
        hungry: { name: "SHOP" },
        sad: { name: "HEALTH" },
        stressed: { name: "WORK" },
        lost: { name: "MOVE" },
        romantic: { name: "STAY" },
        overwhelmed: { name: "COMMUNITY" },
        focused: { name: "BUILD" },
        giving: { name: "GIVE" },
        investing: { name: "INVEST" },
        farming: { name: "FARM" },
        move: { name: "MOVE", super: true },
        airs: { name: "AIRS", hybrid: true, parent: "MOVE" },
        moda: { name: "MODA", hybrid: true, parent: "STAY" }
    },
    // universal fallback
    curiosity: { name: "LEARN" }
};

module.exports = GalaxyMap;
