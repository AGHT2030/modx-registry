/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * AIRS WORMHOLES — BACKEND CANONICAL ROUTING
 * ---------------------------------------------------------
 * Defines how AIRS connects to MODE, MODASTY, COINPURSE,
 * MODXINVST, and META DEVICES.
 *
 * AIRS wormholes are constitutional and cannot be removed.
 */

const AIRS_WORMHOLES = Object.freeze({
    AIRS: {
        key: "AIRS",
        label: "AIRS Mobility & Safety",
        type: "HYBRID",

        portals: {
            pulse: "/airs/pulse",
            safety: "/airs/safety",
            rescue: "/airs/rescue",
            roadside: "/airs/roadside",
            vehicleHistory: "/airs/vehicle-history"
        }
    },

    // --------------------------------------------------
    // MODE ↔ AIRS (Events, Guests, Transport Safety)
    // --------------------------------------------------
    MODE: {
        inbound: {
            eventGuestTransport: {
                description: "Guest arrival, departure, reroute",
                twinAction: "AIRS_ROUTE_EVENT_GUEST"
            },
            emergencyEventPause: {
                description: "Event halted due to safety issue",
                twinAction: "AIRS_EVENT_EMERGENCY"
            }
        }
    },

    // --------------------------------------------------
    // MODA STAY ↔ AIRS (Hotels, Safe Arrival)
    // --------------------------------------------------
    MODASTY: {
        inbound: {
            hotelArrival: {
                description: "Guest arrival verification",
                twinAction: "AIRS_VERIFY_ARRIVAL"
            },
            safeEscort: {
                description: "Escort guest to room or safe zone",
                twinAction: "AIRS_SAFE_ESCORT"
            }
        }
    },

    // --------------------------------------------------
    // COINPURSE ↔ AIRS (Payments, Insurance, Fees)
    // --------------------------------------------------
    COINPURSE: {
        inbound: {
            roadsidePayment: {
                description: "Roadside assistance payment",
                settlement: "COINPURSE_SAFE"
            },
            insuranceClaim: {
                description: "Incident insurance handling",
                settlement: "COINPURSE_INSURANCE_POOL"
            }
        }
    },

    // --------------------------------------------------
    // MODXINVST ↔ AIRS (Governance, Analytics)
    // --------------------------------------------------
    MODXINVST: {
        outbound: {
            fleetRiskAnalytics: {
                description: "Fleet anomaly + safety reports",
                visibility: "INVESTOR_TIERED"
            },
            governmentSafetyMetrics: {
                description: "Aggregated safety intelligence",
                visibility: "GOVERNMENT_ONLY"
            }
        }
    },

    // --------------------------------------------------
    // META DEVICES (Dashboards, Wearables, Glasses)
    // --------------------------------------------------
    META_DEVICES: {
        dashboard: { enabled: true },
        glasses: { enabled: true },
        watch: { enabled: true },
        mobile: { enabled: true }
    }
});

module.exports = {
    AIRS_WORMHOLES
};
