/**
 * © 2025 AG Holdings Trust | AURA Sovereign Layer
 * AURA_NavSync.cjs
 *
 * Purpose:
 *  • Broadcasts NAV updates to AURA Twins, Crisis Dashboard,
 *    Governance Console, ETF dashboards, and Investor UI.
 *  • Maintains in-memory NAV cache for GalaxyRouter sovereign routing.
 *  • Applies PQC signature for tamper-evident NAV telemetry.
 */

const pqc = require("../security/pqc_shield.cjs");

// In-memory NAV cache used by GalaxyRouter + Governance Engines
const NAV_CACHE = {};

module.exports = {
    /**
     * Save NAV snapshot and broadcast system-wide
     */
    update(etf, nav) {
        const value = Number(nav);
        NAV_CACHE[etf] = value;

        const signature = pqc.hashEvent("NAV_UPDATE", {
            etf,
            nav: value,
            ts: Date.now()
        });

        if (global.IO) {
            global.IO.emit("nav:update", {
                etf,
                nav: value,
                signature
            });
        }

        console.log(`📡 AURA NAV Sync → ${etf} NAV=${value}`);

        return value;
    },

    /**
     * Retrieve cached NAV (avoids repeated on-chain calls)
     */
    get(etf) {
        return NAV_CACHE[etf] ?? null;
    },

    /**
     * Retrieve full NAV map
     */
    all() {
        return NAV_CACHE;
    }
};
