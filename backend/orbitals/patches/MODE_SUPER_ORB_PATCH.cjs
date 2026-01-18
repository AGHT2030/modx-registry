/**
 * © 2025 AG Holdings Trust | MODE Sovereign Intelligence
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * MODE_SUPER_ORB_PATCH — Royal Core Edition
 * -----------------------------------------------------------
 * Expands MODE from a sub-orb hybrid into a full Sovereign
 * Royal-Class Super-Orb with constitutional privileges,
 * wormhole routing rights, and Twin priority authority.
 *
 * This patch:
 *   • Elevates MODE to Sovereign Super-Orb (Royal Core)
 *   • Adds MODE Galaxy: Pulse, WrapUp, VenueTwin, EventPortal,
 *     GuestPortal, CoordinatorOps, CorpSuite, LicensingOps,
 *     PaymentPortal, FranchiseCenter
 *   • Defines MODE Wormholes: AIRS↔MODE, MODASTY↔MODE,
 *     CREATV↔MODE, CoinPurse↔MODE
 *   • Grants MODE Royal-Class quantum signature + twin priority
 *   • Preserves constitution-level MODX sovereignty rules
 */

module.exports = Object.freeze({

    // -----------------------------------------------------------
    // 1️⃣ SUPER-ORB ELEVATION (Royal Core Rank)
    // -----------------------------------------------------------
    SUPER_ORB: {
        key: "MODE",
        label: "MODE Royal Core",
        class: "ROYAL_CORE",                    // top 1% privileged rank
        color: "#f5d142",                       // gold–white luminous
        orbitLevel: 0.5,                        // above all level-1 orbs
        luminosity: "quantum-gold-shift",       // 3D hologram accent
        description:
            "MODE Royal Core governs AI orchestration across events, hotels, "
            + "corporate systems, guest flows, and immersive operations."
    },

    // -----------------------------------------------------------
    // 2️⃣ MODE GALAXY — all systems MODE governs
    // -----------------------------------------------------------
    GALAXY: {
        key: "MODE_GALAXY",
        label: "MODE Galaxy",
        children: [
            "PULSE",
            "BUSINESS_PULSE",
            "WRAPUP",
            "EVENT_PORTAL",
            "GUEST_PORTAL",
            "VENUE_TWIN",
            "COORDINATOR_OPS",
            "CORP_SUITE",
            "LICENSE_CENTER",
            "PAYMENT_PORTAL",
            "FRANCHISE_CENTER"
        ]
    },

    // -----------------------------------------------------------
    // 3️⃣ MODE Galaxy Modules (Subnodes)
    // -----------------------------------------------------------
    MODULES: {

        PULSE: {
            key: "PULSE",
            label: "Pulse (Emotional AI Timeline)",
            description:
                "The real-time emotional/operational AI module that guides guests, "
                + "staff, and events through dynamic touchpoints.",
            twinRole: "Pulse Twin",
            orbitClass: "hybrid"
        },

        BUSINESS_PULSE: {
            key: "BUSINESS_PULSE",
            label: "Business Pulse",
            description:
                "Corporate + luxury event intelligence module with professional-grade "
                + "timelines, agenda sync, guest movement, and analytics.",
            twinRole: "Business Pulse Twin",
            orbitClass: "hybrid"
        },

        WRAPUP: {
            key: "WRAPUP",
            label: "WrapUp (Event Closure Engine)",
            description:
                "Post-event AI closure engine handling analytics, satisfaction scoring, "
                + "AIRS-based routing home, gift summary, photo bundles, and settlement.",
            orbitClass: "hybrid"
        },

        EVENT_PORTAL: {
            key: "EVENT_PORTAL",
            label: "Event Portal",
            description:
                "One-link portal for weddings, conferences, corporate retreats, "
                + "immersive experiences, and hotel events.",
            orbitClass: "portal"
        },

        GUEST_PORTAL: {
            key: "GUEST_PORTAL",
            label: "Guest Portal",
            description:
                "QR-based portal directing guests to event details, AI directions, "
                + "Pulse notifications, seating, schedules, and urgent announcements.",
            orbitClass: "portal",
            securityTier: "adaptive"
        },

        VENUE_TWIN: {
            key: "VENUE_TWIN",
            label: "Venue Twin",
            description:
                "Digital twin of the event venue with 3D/AR mapping, holographic "
                + "pathfinding, and real-time occupancy analytics.",
            orbitClass: "twin"
        },

        COORDINATOR_OPS: {
            key: "COORDINATOR_OPS",
            label: "Coordinator Ops Console",
            description:
                "AI-enhanced full event operations dashboard for planners, "
                + "coordinators, staff, and strategy teams.",
            orbitClass: "ops"
        },

        CORP_SUITE: {
            key: "CORP_SUITE",
            label: "Corporate Suite",
            description:
                "High-security corporate event environment with encrypted schedules, "
                + "VIP routing, Quantum-Lock sessions, and private AI protocols.",
            securityTier: "LEVEL_D",
            orbitClass: "enterprise"
        },

        LICENSE_CENTER: {
            key: "LICENSE_CENTER",
            label: "MODE Licensing Center",
            description:
                "Franchise licensing, coordinator certification, hotel partnership "
                + "activation, renewal management, and compliance.",
            orbitClass: "governance"
        },

        PAYMENT_PORTAL: {
            key: "PAYMENT_PORTAL",
            label: "Payment Portal",
            description:
                "Integrated CoinPurse and MODAPLY portal for booking fees, "
                + "licensing payments, renewals, venue deposits, and premium tiers.",
            orbitClass: "financial",
            paymentEnabled: true
        },

        FRANCHISE_CENTER: {
            key: "FRANCHISE_CENTER",
            label: "Franchise Center",
            description:
                "Licensed MODE franchise hub for planners, coordinators, hotels, "
                + "venue partners, and creators.",
            orbitClass: "governance"
        }
    },

    // -----------------------------------------------------------
    // 4️⃣ MODE Wormholes — instant-routing connections
    // -----------------------------------------------------------
    WORMHOLES: {

        // Event Guest & Staff Routing
        AIRS: {
            route: "GUEST_ROUTING",
            description:
                "AIRS responds to Pulse and Business Pulse for guest movement, "
                + "bride arrival, VIP escort, late arrivals, and emergencies."
        },

        // Hotel & Venue Automations
        MODASTY: {
            route: "VENUE_AUTOMATION",
            description:
                "Controls hotel room blocks, check-in flows, seating plans, "
                + "AURA concierge interactions, and safe-haven overrides."
        },

        // XRPL + Payments + Licensing
        COINPURSE: {
            route: "FINANCIALS",
            description:
                "Handles bookings, deposits, licensing renewals, franchise payments, "
                + "coordinator tiers, and premium AI add-ons."
        },

        // Hybrid Content + Immersive Experiences
        CREATV: {
            route: "IMMERSIVE_MEDIA",
            description:
                "Connects events to live media, holographic shows, private screenings, "
                + "and multimedia enhancements."
        }
    },

    // -----------------------------------------------------------
    // 5️⃣ MODE Royal Twin Authority
    // -----------------------------------------------------------
    TWIN_AUTHORITY: {
        priority: "SOVEREIGN",
        description:
            "MODE Twins operate with sovereign-level authority in safety, "
            + "operations, hospitality, emergency sequencing, and event command.",
        overrides: [
            "guest-safety",
            "schedule-priority",
            "late-arrival-routing",
            "VIP-emergency-lane",
            "corporate-lockdown-mode"
        ]
    },

    // -----------------------------------------------------------
    // 6️⃣ Constitutional Integration
    // -----------------------------------------------------------
    CONSTITUTION: {
        grantedPowers: [
            "inter-orb routing authority",
            "guest safety priority",
            "coordinator chain of command",
            "AI event orchestration rights",
            "royal-class override level"
        ],
        quantumSignature: "MODE_RoyalCore_QZ-88",
        sentinelGroup: "MODE_Shield"
    }
});
