/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * FILE THREE — MODE_UNIVERSE_BRIDGE
 * -----------------------------------------------------------
 * This file defines:
 *   • MODE Wormholes to AIRS, MODASTY, CREATV, CoinPurse
 *   • MODE Arcs (front-end deep links + 3D orbital routing)
 *   • EventPortal → GuestPortal → Pulse Timeline bindings
 *   • MODE Twin Activation Rules
 *   • MODE Emergency + VIP routing profiles
 *
 * This is the sovereign Universe Bridge for MODE operations.
 */

const { ORBITAL_TREE } = require("../orbital_tree.cjs");

// -----------------------------------------------------------
// 1️⃣ WORMHOLES — MODE <——> CORE HYBRIDS
// -----------------------------------------------------------
const MODE_WORMHOLES = Object.freeze({

    AIRS: {
        id: "MODE↔AIRS",
        lane: "mobility-event-bridge",
        triggers: [
            "guest_late_arrival",
            "bride_arrival",
            "VIP_route",
            "emergency_exit",
            "route_to_safe_zone"
        ],
        description:
            "Creates instant mobility routes for guests, VIPs, and emergencies powered by AIRS Hybrid Intelligence.",
        twinCommand: "AIRS_TWIN_OVERRIDE"
    },

    MODASTY: {
        id: "MODE↔MODASTY",
        lane: "venue-automation-flow",
        triggers: [
            "hotel_block_update",
            "checkin_sync",
            "wedding_suite_ready",
            "VIP_arrival",
            "staff_dispatch"
        ],
        description:
            "Synchronizes venue operations (rooms, staff, concierge, safety) with MODE event timelines.",
        twinCommand: "CONCIERGE_TWIN_ROUTE"
    },

    CREATV: {
        id: "MODE↔CREATV",
        lane: "immersive-media-lane",
        triggers: [
            "ceremony_begin",
            "reception_open",
            "conference_stage_start",
            "media_sync",
            "3D_showtime"
        ],
        description:
            "Injects 3D holograms, immersive effects, media timelines into events controlled by MODE.",
        twinCommand: "CREATV_TWIN_SYNC"
    },

    COINPURSE: {
        id: "MODE↔COINPURSE",
        lane: "financial-lane",
        triggers: [
            "deposit_required",
            "final_settlement",
            "licensing_purchase",
            "renewal_payment"
        ],
        description:
            "Handles all payments for MODE: deposits, rentals, licensing, renewals, premium AI modules.",
        twinCommand: "FINANCIAL_TWIN_HANDOFF"
    }
});

// -----------------------------------------------------------
// 2️⃣ ARCS — FRONTEND ROUTES + DEEP LINK LOGIC
// -----------------------------------------------------------
const MODE_ARCS = Object.freeze({

    EVENT_PORTAL: {
        route: "/event/:eventId",
        deepLink: true,
        qrEnabled: true,
        description:
            "Primary user-facing portal. QR scanning leads directly here from invitations, posters, or staff.",
        activates: ["GUEST_PORTAL", "PULSE"]
    },

    GUEST_PORTAL: {
        route: "/event/:eventId/guest",
        deepLink: true,
        qrEnabled: true,
        description:
            "Guest interface with timelines, directions, announcements, and personal notifications.",
        activates: ["PULSE", "AIRS"]
    },

    PULSE_TIMELINE: {
        route: "/event/:eventId/pulse",
        protected: true,
        description:
            "Pulse AI timeline showing upcoming moments: ceremony, first dance, speeches, cake cutting, etc.",
        triggers: ["MODE_TWIN_FEED"]
    },

    VENUE_TWIN: {
        route: "/event/:eventId/venue-twin",
        protected: true,
        description:
            "3D interactive map, hologram rendering, and crowd heatmaps.",
        activates: ["MODASTY", "AIRS"]
    },

    COORDINATOR_OPS: {
        route: "/mode/ops/:eventId",
        adminOnly: true,
        description:
            "Coordinator dashboard for full event orchestration.",
        activates: ["PULSE", "MODASTY", "CREATV", "COINPURSE"]
    },

    FRANCHISE_CENTER: {
        route: "/mode/franchise",
        adminOnly: true,
        description:
            "Franchise licensing, renewal management, certifications, and coordinator access tiers.",
        activates: ["COINPURSE"]
    },

    PAYMENT_PORTAL: {
        route: "/mode/payments",
        deepLink: true,
        description:
            "CoinPurse portal for invoices, deposits, licensing, premium upgrades.",
        activates: ["COINPURSE"]
    }
});

// -----------------------------------------------------------
// 3️⃣ MODE TWIN ACTIVATION RULES
// -----------------------------------------------------------
const MODE_TWIN_RULES = Object.freeze({

    activation: {
        pulse: [
            "timeline_update",
            "guest_arrived",
            "schedule_shift",
            "VIP_arrival",
            "emergency_flag"
        ],
        venueTwin: [
            "crowd_density_change",
            "bride_movement",
            "room_block_update",
            "stage_event_start"
        ],
        businessPulse: [
            "corporate_agenda_shift",
            "private_meeting_start",
            "confidential_flag"
        ]
    },

    priority: {
        sovereign: [
            "emergency_exit",
            "VIP_protection",
            "late_arrival_critical",
            "lost_child",
            "medical_assist"
        ]
    },

    overrides: {
        AIRS: ["safe_zone_route", "panic_mode", "escorted_travel"],
        MODASTY: ["room_move", "suite_prep", "staff_dispatch"],
        CREATV: ["stage_lights", "3D_projection", "media_sequence_start"]
    }
});

// -----------------------------------------------------------
// 4️⃣ EXPORT — Universe Bridge to be merged by loader
// -----------------------------------------------------------
module.exports = {
    MODE_WORMHOLES,
    MODE_ARCS,
    MODE_TWIN_RULES
};
