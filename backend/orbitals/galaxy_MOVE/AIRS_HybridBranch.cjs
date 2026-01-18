/**
 * © 2025 AG Holdings Trust | AIRS Hybrid Branch
 * Handles sovereign autonomous mobility inside MOVE Orb.
 */

module.exports = {
    id: "AIRS-BRANCH",
    parent: "MOVE",
    hybrid: true,

    capabilities: {
        autonomousTransport: true,
        emergencyRescue: true,
        safeZoneNavigation: true,
        hotelBridgeSupport: true,
        adaptiveCloak: true,
        partnerVisibility: true,
        shieldOverride: true,
        twinLogging: true
    },

    safeZone: {
        ephemeralRouteCodes: true,
        validatedOnly: true,
        survivorOnlyMode: true,
        allowOnlyMODAApprovedZones: true
    }
};
