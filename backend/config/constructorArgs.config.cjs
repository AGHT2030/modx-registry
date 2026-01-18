// © 2025 AIMAL Global Holdings | CoinPurse™ ETF Suite
// Constructor arguments for all INTI / wINTI / Oracle / ETF contracts

module.exports = {
    // ---------------------------------------------------------
    // CORE ASSETS
    // ---------------------------------------------------------
    INTI: [
        process.env.SAFE_TREASURY,        // Treasury Safe
        process.env.MODLINK_DAO,          // DAO Controller
        process.env.BASKET_ORACLE         // Oracle
    ],

    wINTI: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9" // INTI address
    ],

    BasketOracle: [
        process.env.MODLINK_DAO // owner / controller
    ],

    // ---------------------------------------------------------
    // STABLE ETFs
    // ---------------------------------------------------------
    MODUSDpETF: [
        "MODUSD-UNDERLYING",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000101",
        1_000_000,
        "MODUSD Prime ETF",
        "MODUSDp"
    ],

    MODUSDsETF: [
        "MODUSD-UNDERLYING",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000102",
        10_000_000,
        "MODUSD Sovereign ETF",
        "MODUSDs"
    ],

    MODUSDtETF: [
        "MODUSD-UNDERLYING",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000103",
        5_000_000,
        "MODUSD Treasury ETF",
        "MODUSDt"
    ],

    // ---------------------------------------------------------
    // GREEN / WATER / SMART CITY ETFs
    // ---------------------------------------------------------
    MODWTRxETF: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000201",
        "MODA Water ETF",
        "MODWTRx"
    ],

    MODSMARTxETF: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000202",
        "MODA Smart Cities ETF",
        "MODSMARTx"
    ],

    MODAHxETF: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000203",
        "MODA Hospitality ETF",
        "MODAHx"
    ],

    // ---------------------------------------------------------
    // PLAY / FARM / CREATORS ETFs
    // ---------------------------------------------------------
    MODPLYxETF: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000301",
        "MODX Play ETF",
        "MODPLYx"
    ],

    MODFARMxETF: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000302",
        "MODA Farmland ETF",
        "MODFARMx"
    ],

    CREATVxETF: [
        "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        process.env.BASKET_ORACLE,
        "0xA000000000000000000000000000000000000303",
        "CREATV Marketplace ETF",
        "CREATVx"
    ]
};
