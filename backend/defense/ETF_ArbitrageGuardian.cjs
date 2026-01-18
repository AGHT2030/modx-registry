module.exports.ArbitrageGuardian = {
    detect(polyNav, xrplNav) {
        const diff = Math.abs(polyNav - xrplNav);
        if (diff > 0.015) return "CROSS_CHAIN_ARBITRAGE";
        return "NORMAL";
    },

    react(type) {
        if (type === "CROSS_CHAIN_ARBITRAGE") {
            global.ETF_FROZEN = true;
            global.IO.emit("etf:arbitrage:halt");
        }
    }
};
