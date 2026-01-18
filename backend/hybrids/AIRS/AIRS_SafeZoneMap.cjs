const crypto = require("crypto");

let SAFE_ZONES = [
    // Memphis example — but supports GLOBAL scaling
    { alias: "BlueDoor-01", lat: 35.1490, lng: -90.0500, type: "MODA_HOTEL" },
    { alias: "Haven-02", lat: 35.1520, lng: -90.0450, type: "HEAL_CENTER" }
];

function rotateAliases() {
    SAFE_ZONES = SAFE_ZONES.map(z => ({
        ...z,
        alias: crypto.randomBytes(5).toString("hex")
    }));
}

setInterval(rotateAliases, 5 * 60 * 1000); // every 5 minutes

module.exports.AIRS_SafeZoneMap = {
    assignNearest(location) {
        // Basic placeholder
        const chosen = SAFE_ZONES[0];
        return {
            ...chosen,
            publicAlias: chosen.alias
        };
    }
};
