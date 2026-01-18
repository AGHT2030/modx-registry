// backend/galaxies/dao/intake/daoEventIntake.cjs
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Intakes and processes events using the normalizers.
 */

const normalizeHeatmapEvent = require("../normalizers/heatmapNormalizer.cjs");
const normalizeTickerEvent = require("../normalizers/tickerNormalizer.cjs");

module.exports = function intakeEvent(event) {
    let normalizedEvent;

    switch (event.type) {
        case "heatmap:update":
            normalizedEvent = normalizeHeatmapEvent(event);
            break;

        case "ticker:update":
            normalizedEvent = normalizeTickerEvent(event);
            break;

        default:
            throw new Error(`Unknown event type: ${event.type}`);
    }

    // Process normalized event (example)
    console.log("Processed event:", normalizedEvent);

    // You can also push to a database or further processing here
};
