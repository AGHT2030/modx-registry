const { TwinOracle } = require("../../twins/TwinOracle.cjs");

module.exports.AIRS_TwinEscort = {
    prepare({ userId, emotion, safeZone }) {
        return TwinOracle.advise({
            userId,
            emotion: "fear",
            galaxy: "HEAL",
            next: "SAFE_ZONE",
            payload: { safeZone: safeZone.publicAlias }
        });
    }
};
