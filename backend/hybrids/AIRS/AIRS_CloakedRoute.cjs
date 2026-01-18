const crypto = require("crypto");

module.exports.AIRS_CloakedRoute = {
    generate(start, safeZone) {
        return {
            token: crypto.randomBytes(32).toString("hex"),
            hops: [
                { lat: start.lat + .001, lng: start.lng - .001 },
                { lat: start.lat - .002, lng: start.lng + .002 }
            ],
            final: "ENCRYPTED" // vehicle NEVER sees this
        };
    }
};
