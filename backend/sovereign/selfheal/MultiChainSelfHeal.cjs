module.exports = {
    scan(intel) {
        return {
            xrplSync: "OK",
            polygonSync: "OK",
            desyncProbability: Math.random() * 0.1,
            recommendedAction: "NO_ACTION"
        };
    }
};
