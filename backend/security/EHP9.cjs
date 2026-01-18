module.exports = {
    engage(trustee) {
        return {
            status: "HALT_ENGAGED",
            timestamp: Date.now(),
            trustee
        };
    }
};
