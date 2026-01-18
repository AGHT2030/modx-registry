// © 2025 AIMAL Global Holdings | ETF Router Binding
// Connects ETF deployed addresses into the GalaxyRouter and MODLINK governance.

const ETFBridge = require("./ETF_Bridge.cjs");
const telemetry = require("../telemetry/etfTelemetry.cjs");
const pqc = require("../security/pqc_shield.cjs");

// ---------------------------------------------------------
// PRE-LAUNCH SAFE MODE — prevents boot failure if ETF missing
// ---------------------------------------------------------
function safeRegister(router, galaxy, address) {
    if (!address) {
        console.warn(`⚠ [SAFE MODE] ETF for ${galaxy} not deployed — skipping.`);
        return;
    }

    router.registerETF(galaxy, address);

    // Telemetry + Sync
    telemetry.etfActivated(galaxy, address);
    pqc.hashEvent("ETF_ACTIVATE", { galaxy, address });

    global.AURA?.broadcast("etf:activated", { galaxy, address });
    global.MODLINK?.emit("etf:activated", { galaxy, address });

    console.log(`🌌 ETF Activated for Galaxy: ${galaxy} → ${address}`);
}

// ---------------------------------------------------------
// MAIN BINDING EXPORT (SAFE MODE ENABLED)
// ---------------------------------------------------------
module.exports = {
    bindToRouter(router) {
        const etfs = ETFBridge.getAddresses();

        // -------------------------------------------------
        // LEGACY ETFs (already deployed previously)
        // -------------------------------------------------
        safeRegister(router, "PLAY", etfs.MODPMxETF);
        safeRegister(router, "BUILD", etfs.MODUSDtETF);
        safeRegister(router, "MOVE", etfs.MODUSDsETF);
        safeRegister(router, "INVEST", etfs.MODXINVSTETF);

        // -------------------------------------------------
        // NEW ETFs (allowed to be missing during pre-launch)
        // -------------------------------------------------
        safeRegister(router, "WATER", etfs.MODWTRxETF);
        safeRegister(router, "EVENTS", etfs.MODExETF);
        safeRegister(router, "AIRS", etfs.AIRSxETF);

        console.log("🔗 ETF Router Bindings (SAFE MODE ENABLED)");
        console.table(etfs);
    }
};
