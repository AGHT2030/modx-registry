module.exports = function initAuraTwins({ io, auraIO }) {
    if (!io) {
        console.warn("⚠️ AURA Twins skipped — io not ready");
        return;
    }

    const twinsNS = io.of("/aura-twins");

    twinsNS.on("connection", (socket) => {
        const { userId, twin } = socket.handshake.query || {};

        if (userId) socket.join(`user:${userId}`);

        socket.on("twin:status", (payload) => {
            if (auraIO) {
                auraIO.emit("twin:status", payload);
            }
        });

        socket.on("disconnect", () => {
            // no-op safe cleanup
        });
    });

    console.log("🧠 AURA Twins namespace ready");
};
