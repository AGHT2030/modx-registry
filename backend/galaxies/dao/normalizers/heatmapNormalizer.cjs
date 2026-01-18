// backend/galaxies/dao/normalizers/heatmapNormalizer.cjs
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Normalizes incoming heatmap events.
 */

module.exports = function normalizeHeatmapEvent(event) {
    if (!event || !event.payload) {
        throw new Error("Invalid heatmap event payload");
    }

    const { severity, location, timestamp, value } = event.payload;

    // Normalize data (example)
    return {
        severity: severity || "low",
        location: location || "unknown",
        timestamp: timestamp || new Date().toISOString(),
        value: parseFloat(value) || 0
    };
};
