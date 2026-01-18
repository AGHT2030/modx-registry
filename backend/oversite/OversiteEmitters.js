/**
 * © 2025 AG Holdings Trust | Oversite Council Emitters
 * All anomaly, heatmap, and rollback events pass through this unified module.
 */

const { io } = require("../../server");

// 🔥 Report anomaly event
function emitAnomaly(anomalyObj) {
    if (!io) return;
    io.emit("anomaly:detected", anomalyObj);
}

// 🧬 Send quantum infection heatmap update
function emitHeatmap(heatmapArray) {
    if (!io) return;
    io.emit("quantum:infection:heatmap", heatmapArray);
}

// ♻️ Broadcast rollback preview
function emitRollbackPreview(rollbackData) {
    if (!io) return;
    io.emit("rollback:preview", rollbackData);
}

module.exports = {
    emitAnomaly,
    emitHeatmap,
    emitRollbackPreview
};
