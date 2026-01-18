
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

// © 2025 AIMAL Global Holdings | MODLINK HA Arbiter

const { getState } = require("./state-manager");

const THRESHOLD = 10_000; // 10s

module.exports = {
    async determineLeader() {
        const { modlinkTS, xrplTS, coinTS } = await getState();
        const now = Date.now();

        const alive = {
            MODLINK: now - modlinkTS < THRESHOLD,
            XRPL: now - xrplTS < THRESHOLD,
            COINPURSE: now - coinTS < THRESHOLD,
        };

        // 1️⃣ If all three nodes dead → FREEZE MODE
        if (!alive.MODLINK && !alive.XRPL && !alive.COINPURSE) {
            return { leader: "NONE", freeze: true, alive };
        }

        // 2️⃣ MODLINK Core = always primary leader if alive
        if (alive.MODLINK) return { leader: "MODLINK", freeze: false, alive };

        // 3️⃣ XRPL Gateway = secondary leader
        if (alive.XRPL) return { leader: "XRPL", freeze: false, alive };

        // 4️⃣ CoinPurse fallback
        if (alive.COINPURSE) return { leader: "COINPURSE", freeze: false, alive };

        return { leader: "NONE", freeze: true, alive };
    }
};
