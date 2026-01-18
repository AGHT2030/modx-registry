// © 2025 AG Holdings Trust | MODX Governance Router

module.exports.route = function routeGovernanceEvent(payload) {
    const { contract, event } = payload;

    switch (contract) {
        case "AIRS":
            return require("./handlers/airsHandler")(payload);
        case "MODA":
            return require("./handlers/modaHandler")(payload);
        case "MODE":
            return require("./handlers/modeHandler")(payload);
        case "COINPURSE":
            return require("./handlers/coinpurseHandler")(payload);
        default:
            return;
    }
};
