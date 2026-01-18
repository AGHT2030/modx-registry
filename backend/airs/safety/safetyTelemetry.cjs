// © 2025 AIMAL Global Holdings | AIRS Safety Telemetry

module.exports = {
    push(eventType, payload) {
        const AURA = global.AURA || null;
        const MODLINK = global.MODLINK || null;

        const packet = {
            eventType,
            payload,
            timestamp: Date.now()
        };

        AURA?.broadcast("airs:safetyTelemetry", packet);
        MODLINK?.emit("airs:safetyTelemetry", packet);

        console.log("📡 AIRS Safety Telemetry:", packet);

        return packet;
    }
};
