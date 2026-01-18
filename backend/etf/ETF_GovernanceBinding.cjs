/**
 * MODLINK Governance Binding for ETF Suite
 */

const ETFRegistry = require("./ETFRegistry.cjs");

module.exports = {
    getVotingWeight(etf) {
        switch (etf) {
            case "MODUSDx": return 5;     // infrastructure, high impact
            case "MODXINVST": return 7;   // capital allocation
            case "MODUSDs": return 10;    // safety-sensitive + AIRS
            default: return 1;
        }
    },

    bindToMODLINK(modlink) {
        for (const [k, v] of Object.entries(ETFRegistry)) {
            modlink.registerETF({
                symbol: v.symbol,
                type: v.type,
                votingWeight: this.getVotingWeight(k),
                unitSize: v.unitSize
            });
        }
    }
};
