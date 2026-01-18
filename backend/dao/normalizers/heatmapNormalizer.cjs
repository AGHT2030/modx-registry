/**
 * A6 Heatmap Normalizer
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 */
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

const SEVERITY_MAP = {
    0: "LOW",
    1: "LOW",
    2: "MEDIUM",
    3: "HIGH",
    4: "CRITICAL",
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    critical: "CRITICAL"
};

function normalizeSeverity(input) {
    if (input === undefined || input === null) return "LOW";
    return SEVERITY_MAP[input] || "LOW";
}

function normalizeIntensity(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.min(1, Math.max(0, n));
}

function normalizeHeatmap(raw = {}, source = "unknown") {
    return {
        type: "A6_HEATMAP_UPDATE",
        source,
        severity: normalizeSeverity(raw.severity || raw.level),
        intensity: normalizeIntensity(raw.intensity ?? raw.value ?? raw.severity),
        region: raw.region || raw.zone || null,
        timestamp: raw.timestamp || new Date().toISOString(),
        meta: {
            legacyEvent: raw.event || null,
            chain: raw.chain || null
        }
    };
}
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
    }
};
