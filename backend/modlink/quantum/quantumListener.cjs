/**
 * © 2025 AG Holdings Trust | MODX
 * Quantum → MODLINK Bridge
 */

module.exports = function initQuantumListener(io) {
    if (!io) {
        console.warn("⚠️ Quantum listener skipped — no socket layer");
        return;
    }

    io.on("connection", (socket) => {
        socket.on("quantum:infection", (alerts) => {
            console.warn("🚨 QUANTUM ALERT RECEIVED");

            if (global.MODLINK?.dao?.emit) {
                global.MODLINK.dao.emit("security:quantum", {
                    source: "QuantumIP",
                    alerts,
                    timestamp: Date.now(),
                });
            } else {
                console.warn("⚠️ MODLINK DAO not ready — alert queued only");
            }
        });
    });

    console.log("🔗 Quantum → MODLINK listener armed");
};
