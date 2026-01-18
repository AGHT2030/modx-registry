// © 2025 AIMAL Global Holdings | MLA Governance Registry
// Defines all MLA action IDs, metadata, parameter schemas,
// domain routing, compliance tags, and risk classifications.

module.exports = {

    // ---------------------------------------------------------
    // Core ETF Actions
    // ---------------------------------------------------------
    MLA_ETF_INCREASE_CEILING: {
        domain: "ETF",
        description: "Increase ETF ceiling limit.",
        params: { value: "number" },
        risk: "MEDIUM",
        allowedTargets: ["MODUSDpETF", "MODUSDxETF", "MODUSDsETF"]
    },

    MLA_ETF_DECREASE_CEILING: {
        domain: "ETF",
        description: "Reduce ETF ceiling limit.",
        params: { value: "number" },
        risk: "HIGH",
        allowedTargets: ["MODUSDpETF", "MODUSDxETF", "MODUSDsETF"]
    },

    MLA_ETF_FREEZE_MINT: {
        domain: "ETF",
        description: "Pause minting for the ETF.",
        params: {},
        risk: "LOW",
        allowedTargets: ["ALL_ETFS"]
    },

    MLA_ETF_UNFREEZE_MINT: {
        domain: "ETF",
        description: "Resume minting for the ETF.",
        params: {},
        risk: "LOW",
        allowedTargets: ["ALL_ETFS"]
    },

    MLA_ETF_SET_UNIT_SIZE: {
        domain: "ETF",
        description: "Adjust ETF unit size.",
        params: { unitSize: "number" },
        risk: "MEDIUM",
        allowedTargets: ["MODUSDxETF", "MODUSDsETF"]
    },

    MLA_ETF_REBALANCE: {
        domain: "ETF",
        description: "Trigger a portfolio rebalance.",
        params: { mode: "string" },
        risk: "MEDIUM",
        allowedTargets: ["MODUSDpETF", "MODUSDxETF", "MODUSDsETF"]
    },

    // ---------------------------------------------------------
    // Galaxy Actions (PLAY, SHOP, MOVE, STAY, MODE, INVEST, HEAL, BUILD, GROW)
    // ---------------------------------------------------------
    MLA_GALAXY_SET_DEFAULT_ETF: {
        domain: "GALAXY",
        description: "Assign default ETF for a Galaxy.",
        params: { galaxy: "string", etf: "string" },
        risk: "LOW",
        allowedTargets: ["ALL_GALAXIES"]
    },

    MLA_GALAXY_RESTRICT_LIQUIDITY: {
        domain: "GALAXY",
        description: "Apply liquidity restrictions on a Galaxy.",
        params: { galaxy: "string", level: "string" },
        risk: "MEDIUM",
        allowedTargets: ["ALL_GALAXIES"]
    },

    // ---------------------------------------------------------
    // CoinPurse Governance
    // ---------------------------------------------------------
    MLA_COINPURSE_SET_AUTH_POLICY: {
        domain: "COINPURSE",
        description: "Update user authentication policy.",
        params: { mode: "string" },
        risk: "LOW",
        allowedTargets: ["COINPURSE"]
    },

    MLA_COINPURSE_ENABLE_2FA: {
        domain: "COINPURSE",
        description: "Turn on two-factor authentication.",
        params: {},
        risk: "LOW",
        allowedTargets: ["COINPURSE"]
    },

    // ---------------------------------------------------------
    // CREATV Governance
    // ---------------------------------------------------------
    MLA_CREATV_APPROVE_CONTENT: {
        domain: "CREATV",
        description: "Approve uploaded digital content.",
        params: { contentId: "string" },
        risk: "LOW",
        allowedTargets: ["CREATV"]
    },

    MLA_CREATV_SET_LICENSE_POLICY: {
        domain: "CREATV",
        description: "Update licensing rules.",
        params: { policy: "string" },
        risk: "MEDIUM",
        allowedTargets: ["CREATV"]
    },

    // ---------------------------------------------------------
    // Meta-Governance Controls
    // ---------------------------------------------------------
    MLA_SYSTEM_SET_TIMELOCK_DURATION: {
        domain: "SYSTEM",
        description: "Set governance timelock duration.",
        params: { seconds: "number" },
        risk: "LOW",
        allowedTargets: ["SYSTEM"]
    }
};
