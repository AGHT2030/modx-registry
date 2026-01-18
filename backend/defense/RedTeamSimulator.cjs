module.exports.RedTeam = {
    runScenario(type, trusteeEmail) {
        global.IO.emit("redteam:scenario", { type, trustee: trusteeEmail });

        switch (type) {
            case "FP_ATTACK":
                return { success: false, reason: "TIF_MISMATCH" };
            case "GEO_SPOOF":
                return { success: false, reason: "GEO_LOCK" };
            case "DRIFT_VARIANCE":
                return { success: false, reason: "AURA_DRIFT" };
            default:
                return { success: false, reason: "UNKNOWN" };
        }
    }
};
