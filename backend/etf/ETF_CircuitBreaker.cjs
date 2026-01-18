/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ETF Circuit Breaker Engine (Extended Version)
 *
 * Provides:
 *  • Volatility-based automatic halts
 *  • Multi-tick Volatility Window Averaging (VWA)
 *  • C5 Threat Engine correlation hooks
 *  • GalaxyFirewall integration (INVEST, PLAY, SHOP, etc.)
 *  • PQC-hashed audit logging
 *  • AURA Twin broadcast events
 */

const C5 = require("../sentinel/C5_Engine.cjs");
const GalaxyFirewall = require("../universe/GalaxyFirewall.cjs");

// Volatility tracking window
const WINDOW_SIZE = 5;

module.exports = {
    lastNav: {},
    window: {},    // sliding NAV volatility window: { ETF: [nav1, nav2, ...] }

    /**
     * Evaluate NAV movement + stability window
     */
    check(etfName, newNav) {
        // Initialize window
        if (!this.window[etfName]) this.window[etfName] = [];

        const windowArr = this.window[etfName];

        // Add new NAV, keep last N entries
        windowArr.push(newNav);
        if (windowArr.length > WINDOW_SIZE) windowArr.shift();

        // NAV delta for this tick
        const last = this.lastNav[etfName] || newNav;
        const delta = Math.abs(newNav - last) / last;

        // Update last known NAV
        this.lastNav[etfName] = newNav;

        // Compute window volatility average
        const avg =
            windowArr.reduce((a, b) => a + b, 0) / windowArr.length;

        const avgDelta = Math.abs(newNav - avg) / avg;

        // ----------------------------
        // 1) HARD VOLATILITY THRESHOLD
        // ----------------------------
        if (delta > 0.12) {
            return this.triggerHalt(etfName, newNav, delta, "NAV spike > 12%");
        }

        // ----------------------------
        // 2) WINDOW-AVERAGE DEVIATION
        // ----------------------------
        if (avgDelta > 0.08) {
            return this.triggerHalt(
                etfName,
                newNav,
                avgDelta,
                "Smoothed volatility > 8% window"
            );
        }

        return false;
    },

    /**
     * Trigger complete ETF freeze + governance alerts
     */
    triggerHalt(etfName, nav, delta, reason) {
        global.ETF_FROZEN = true;

        // ----------------------------
        // Emit PQC-protected audit log
        // ----------------------------
        const pqcHash = require("../pqc/PQC_Hasher.cjs").hash({
            etf: etfName,
            nav,
            delta,
            reason,
            ts: Date.now()
        });

        console.warn(
            `🚨 ETF CIRCUIT BREAKER ACTIVATED → ${etfName} | Reason: ${reason} | PQC Hash: ${pqcHash}`
        );

        // ----------------------------
        // AURA Twin Broadcast
        // ----------------------------
        if (global.IO) {
            global.IO.emit("etf:freeze", {
                etf: etfName,
                nav,
                delta,
                reason,
                pqcHash
            });
        }

        // ----------------------------
        // Notify Galaxy Firewall
        // ----------------------------
        if (["MODUSDx", "MODUSDs", "MODUSDp"].includes(etfName)) {
            GalaxyFirewall.isolate("INVEST", `Volatility halt: ${reason}`);
        }
        if (etfName.includes("PLAY")) {
            GalaxyFirewall.isolate("PLAY", reason);
        }
        if (etfName.includes("SHOP")) {
            GalaxyFirewall.isolate("SHOP", reason);
        }

        // ----------------------------
        // C5 Threat Correlation
        // ----------------------------
        const threat = C5.evaluate({
            drift: "NORMAL",
            fpMatch: "MATCH",
            govEvents: global.GOV_EVENTS || 0,
            volatility: delta,
            subsystem: "ETF"
        });

        if (C5.applyPropagation) {
            C5.applyPropagation(threat);
        }

        return true;
    },

    /**
     * Manually or automatically restore ETF operations
     */
    restore() {
        global.ETF_FROZEN = false;

        if (global.IO) {
            global.IO.emit("etf:unfreeze", {
                ts: Date.now()
            });
        }

        console.log("🟢 ETF CIRCUIT BREAKER RESET — Operations restored");
    }
};
