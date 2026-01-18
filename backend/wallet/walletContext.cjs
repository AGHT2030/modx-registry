// © 2025 AIMAL Global Holdings | CoinPurse Hybrid Wallet Context
// ------------------------------------------------------------------
// Holds runtime-safe wallet environment state for XRPL + EVM + MODX
// Ensures app can launch even if networks are unavailable.

module.exports = {
    state: {
        xrpl: {
            mode: "SAFE",
            connected: false,
            lastCheck: null,
        },
        evm: {
            mode: "SAFE",
            connected: false,
            lastCheck: null,
        },
        cache: {
            balances: {},
            updated: null,
        }
    },

    setXRPLStatus(mode, connected) {
        this.state.xrpl = {
            mode,
            connected,
            lastCheck: Date.now()
        };

        global.XRPL_STATUS = mode;
    },

    setEVMStatus(mode, connected) {
        this.state.evm = {
            mode,
            connected,
            lastCheck: Date.now()
        };

        global.EVM_STATUS = mode;
    },

    updateBalances(balances) {
        this.state.cache = {
            balances,
            updated: Date.now()
        };

        global.WALLET_CONTEXT = this.state;
    },

    getState() {
        return this.state;
    }
};
