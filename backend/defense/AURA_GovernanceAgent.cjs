module.exports.AGA = {
    evaluate(state) {
        if (state.drift !== "NORMAL") return "LOCKDOWN_DRIFT";
        if (state.fp !== "MATCH") return "LOCKDOWN_FP";
        if (state.c5 === "CRITICAL") return "LOCKDOWN_CRITICAL";
        if (state.navShock) return "HALT_FINANCIAL";

        return "NORMAL";
    },

    enforce(result) {
        if (result.startsWith("LOCKDOWN")) {
            global.SYSTEM_LOCKED = true;
            global.IO.emit("aga:lockdown", { result });
        }
    }
};
