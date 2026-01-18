// © 2025 AIMAL Global Holdings | AIRS Safety Event Formatter

module.exports = {
    buildEvent({ rideId, twinId, severity, action, location, details, target }) {
        return {
            rideId,
            twinId,
            severity,
            action,
            location: location || null,
            target: target || null,
            details: details || null,
            timestamp: Date.now()
        };
    }
};
