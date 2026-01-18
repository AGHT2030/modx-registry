module.exports.AIRS_EndangermentDetector = {
    detect(event = {}) {
        if (event.forcedStop || event.vehicleLooping || event.userFearSignal) {
            return { confirmed: true, emotion: "fear" };
        }
        return { confirmed: false, reason: "NO_THREAT" };
    }
};
