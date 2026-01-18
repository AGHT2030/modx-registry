let state = { level: "INIT", type: "INIT", payload: null };

module.exports = {
    update(signal) {
        state = {
            level: signal.level,
            type: signal.type,
            payload: signal.payload,
            timestamp: Date.now()
        };
        return state;
    },

    set(type) {
        state = {
            level: "CRITICAL",
            type,
            payload: null,
            timestamp: Date.now()
        };
        return state;
    },

    get() {
        return state;
    }
};
