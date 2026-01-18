module.exports.NSDG = {
    ingest(event) {
        global.NSDG_EVENTS.push(event);
    },

    classify(event) {
        if (event.type === "DRIFT") return "BEHAVIORAL";
        if (event.type === "GEO") return "LOCATION";
        if (event.type === "FP") return "IDENTITY";
        if (event.type === "BREAKER") return "FINANCIAL";
        return "GENERAL";
    },

    propagate(event) {
        const cluster = this.classify(event);
        global.IO.emit("nsdg:update", { ...event, cluster });
    }
};
