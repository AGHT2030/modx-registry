// Maps legacy camelCase actions into MLA Action-IDs

const mapping = {
    increaseCeiling: "MLA_ETF_INCREASE_CEILING",
    decreaseCeiling: "MLA_ETF_DECREASE_CEILING",
    freezeMint: "MLA_ETF_FREEZE_MINT",
    unfreezeMint: "MLA_ETF_UNFREEZE_MINT",
    setUnitSize: "MLA_ETF_SET_UNIT_SIZE",
    rebalance: "MLA_ETF_REBALANCE",
    approveContent: "MLA_CREATV_APPROVE_CONTENT",
    setAuthPolicy: "MLA_COINPURSE_SET_AUTH_POLICY"
};

module.exports = {
    toMLA(action) {
        return mapping[action] || action;
    }
};
