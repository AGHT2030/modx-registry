/**
 * © 2025 AG Holdings Trust | MODX Sovereign ETF Registry
 * Option-C Multi-Layer ETF Suite (Immutable + Upgradeable + Adaptive)
 */

module.exports = Object.freeze({
    MODUSDp: {
        symbol: "MODUSDp",
        type: "IMMUTABLE",
        purpose: "Retail Stable ETF",
        contract: "0xMODUSDp_CONTRACT",
        unitSize: 1_000_000
    },
    PLAY: {
        symbol: "PLAYETF",
        type: "IMMUTABLE",
        purpose: "Game Credit ETF",
        contract: "0xPLAYETF_CONTRACT",
        unitSize: 1_000_000
    },
    SHOP: {
        symbol: "SHOPETF",
        type: "IMMUTABLE",
        purpose: "Retail Rewards ETF",
        contract: "0xSHOPETF_CONTRACT",
        unitSize: 250_000
    },
    MODUSDx: {
        symbol: "MODUSDx",
        type: "GOV_UPGRADEABLE",
        purpose: "Infrastructure + Green Build ETF",
        contract: "0xMODUSDx_CONTRACT",
        unitSize: 5_000_000
    },
    MODXINVST: {
        symbol: "MODXINVST",
        type: "GOV_UPGRADEABLE",
        purpose: "Investment ETF",
        contract: "0xMODXINVST_CONTRACT",
        unitSize: "10M_OR_20M"
    },
    MODUSDs: {
        symbol: "MODUSDs",
        type: "ADAPTIVE",
        purpose: "Safety + AIRS Rescue ETF",
        contract: "0xMODUSDs_CONTRACT",
        unitSize: 10_000_000
    }
});
