/**
 * © 2025 AG Holdings Trust | MOVE Hybrid Orb
 * MOVE → AIRS Sovereign Mobility Layer
 */

module.exports = {
    id: "MOVE-HYBRID",
    displayName: "MOVE Hybrid Orb",
    governs: ["AIRS", "MODE-MOBILITY", "MODA-HOTEL-RESCUE"],
    hybrid: true,

    safety: {
        trustGoverned: true,                // TRUST governs AIRS
        modxShieldCommander: true,          // Option B active
        twinOversight: true,                // AURA Twins supervise
        adaptiveCloak: true,                // Option C active
        pinMyFiveRequired: true,            // Preflight identity check
        safeZoneRequiredForVictims: true,   // All abuse victims rerouted automatically
        ephemeralCodes: true,               // 5-min rotating codes
    },

    integrations: {
        AIRS: true,
        MODE: true,
        MODA_Hotel: true,
        CREATV: false
    }
};
