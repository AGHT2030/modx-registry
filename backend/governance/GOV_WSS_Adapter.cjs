// © 2025 AIMAL Global Holdings | Governance WebSocket Adapter

const globalSafeRequire = require("../middleware/globalSafeRequire");

const GOVBUS = globalSafeRequire(
    "./GovernanceBus.cjs",
    null
);

module.exports = function initGovSocket(io) {

    console.log("🔌 Governance WebSocket bridge active.");

    const events = [
        "proposal:preflight",
        "proposal:analysis",
        "proposal:queued",
        "proposal:timelocked",
        "proposal:execute",
        "proposal:executed",
        "proposal:audit",
        "proposal:archive"
    ];


    if (!GOVBUS || typeof GOVBUS.on !== "function") {
        console.warn("⚠️ GovernanceBus unavailable — WSS adapter running in passive mode");
        return;
    }

    events.forEach((evt) => {
        GOVBUS.on(evt, (payload) => {
            // existing logic untouched
        });
    });
};
