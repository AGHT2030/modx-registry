/**
 * © 2025–2026 AG Holdings Trust | MODX Sovereign Technologies
 * Universe Module Barrel Export
 *
 * Purpose:
 * - Canonical entry point for Universe-level modules
 * - Prevents brittle deep-import paths
 * - Enables MODLINK + DAO + AutoSync to resolve GalaxyRouter safely
 */

"use strict";

module.exports = require("./GalaxyRouter.js");
/**
 * © 2025–2026 AG Holdings Trust | MODX Sovereign Technologies
 * Universe Module Index
 *
 * Purpose:
 * - Stable export surface for universe-layer modules
 * - Prevents brittle deep-path imports
 * - Required by MODLINK auto-sync and governance bridges
 */

"use strict";

module.exports = {
    GalaxyRouter: require("./GalaxyRouter.js"),
    UniverseTelemetry: require("./UniverseTelemetry.js")
};

