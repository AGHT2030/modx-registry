/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * AIRS Hybrid Integrity Map
 * -------------------------
 * Encodes safety, anti-abuse, and passenger-protection logic for:
 *  - PINMYFIVE™
 *  - Endangerment detection
 *  - Driver verification BEFORE passenger entry
 *  - AURA Twins OnAlert state
 *  - Pulse assistance & route anomaly detection
 *
 * This file is CONFIG — enforcement is done by:
 *  - MODX Shield Enforcement Engine
 *  - Hybrid Layer Safeguard Map
 *  - AURA / KZ Oversight
 */

"use strict";

module.exports = Object.freeze({
    meta: Object.freeze({
        hybrid: "AIRS",
        version: "2025.12.05",
        sovereign_owner: "AG_Holdings_Trust",
        description: "AIRS safety, PINMYFIVE, endangerment & twin OnAlert rules.",
        shield_required: true,
        twin_required: true,
        modx_shield_binding: "MODX_SHIELD_AIRS_V1"
    }),

    // ---------------------------------------------------------
    // CORE SAFETY MODES
    // ---------------------------------------------------------
    modes: Object.freeze({
        NORMAL: "NORMAL",
        ON_ALERT: "ON_ALERT",          // Twins actively watching the ride
        PINMYFIVE: "PINMYFIVE_ACTIVE", // Safety-phrase activated
        EMERGENCY: "EMERGENCY_LOCK",   // High-risk / endangerment response
        QUARANTINE: "QUARANTINE"       // Driver/vehicle flagged ecosystem-wide
    }),

    // ---------------------------------------------------------
    // PINMYFIVE™ PROTECTION SUITE
    // ---------------------------------------------------------
    pinMyFive: Object.freeze({
        enabled: true,
        phrase: "PINMYFIVE", // Voice or typed trigger
        minTrustedContacts: 5,
        actionsOnTrigger: Object.freeze([
            "LOCK_ROUTE_METADATA",       // Freeze route, car, driver, time, trip ID
            "NOTIFY_TRUSTED_CONTACTS_5", // Send live link + car info to 5 contacts
            "ELEVATE_TO_ON_ALERT",       // Twins switch to ON_ALERT monitoring
            "ENABLE_LIVE_TELEMETRY",     // High-frequency location pings to MODX
            "SHOW_REASSURANCE_OVERLAY",  // Calm UI: 'We’re with you. Help is live.'
            "ARM_EMERGENCY_SHORTCUTS"    // One-tap: call 911/security / safe stop
        ]),
        allowedDeactivation: Object.freeze({
            // ONLY rider (or Oversight via KZ/AURA) can turn it off
            byRider: true,
            byDriver: false,
            bySupport: true, // logged and AURA-verified
            requireTwinConfirmation: true
        })
    }),

    // ---------------------------------------------------------
    // PRE-RIDE VERIFICATION (BEFORE PASSENGER GETS IN CAR)
    // ---------------------------------------------------------
    preRideVerification: Object.freeze({
        enabled: true,
        requiredBeforeStatus: "RIDE_START",
        checks: Object.freeze({
            driverPhotoMatch: true,
            vehiclePlateMatch: true,
            vehicleMakeModelMatch: true,
            officialAppHandshake: true, // No off-platform handoffs
            geoMatchPickupZone: true,   // Must be at declared pickup location
            backgroundRiskCheck: true   // Driver risk profile < threshold
        }),
        twinOnAlertBootstrap: Object.freeze({
            // Twins go into soft OnAlert once driver is detected near pickup
            enableOnDriverNearby: true,
            minDistanceMeters: 100,
            actions: Object.freeze([
                "BEGIN_ROUTE_PREVIEW",
                "CHECK_HISTORICAL_DRIVER_BEHAVIOR",
                "ENABLE_MICRO_PULSE_MONITORING"
            ])
        }),
        uiPrompts: Object.freeze({
            confirmDriver: "Confirm driver name & photo match before entering.",
            confirmVehicle: "Check plate & vehicle. If anything feels wrong, do not enter.",
            quickHelp: "Tap here to contact support or trigger PINMYFIVE."
        })
    }),

    // ---------------------------------------------------------
    // IN-RIDE MONITORING & ENDANGERMENT DETECTION
    // ---------------------------------------------------------
    inRideMonitoring: Object.freeze({
        enabled: true,
        anomalySignals: Object.freeze({
            repeatedLoopRadiusMeters: 200,      // Circling in tight loop
            repeatedLoopThreshold: 3,           // 3+ loops = anomaly
            routeDeviationPercent: 35,          // Off planned route by >35%
            hardBrakingEvents: 5,
            speedingThresholdOverLimitKmh: 20,
            doorLockManipulation: true,         // Doors locked when attempt to exit
            emergencyZoneAvoidance: true        // Avoiding well-lit/central areas
        }),
        onAnomalyDetected: Object.freeze([
            "ESCALATE_TO_ON_ALERT",
            "NOTIFY_RIDER_CALMLY",
            "INCREASE_TELEMETRY_FREQUENCY",
            "ENABLE_SOFT_SUGGEST_EXIT_TO_SAFE_SPOT",
            "TAG_DRIVER_FOR_REVIEW"
        ]),
        onHighRiskEndangerment: Object.freeze([
            "SWITCH_TO_EMERGENCY_LOCK",
            "FREEZE_DRIVER_FROM_NEW_RIDES",
            "OPEN_EMERGENCY_UI_FOR_RIDER",
            "OFFER_CALL_LAW_ENFORCEMENT",
            "OFFER_CALL_TRUSTED_CONTACT",
            "LOG_EVENT_TO_KZ_OVERSIGHT",
            "HARD_ALERT_TO_OVERSIGHT_COMMITTEE"
        ])
    }),

    // ---------------------------------------------------------
    // AURA TWINS ONALERT + PULSE ASSISTANCE
    // ---------------------------------------------------------
    twinOnAlert: Object.freeze({
        enabled: true,
        twins: Object.freeze(["Ari", "Agador"]),
        triggers: Object.freeze([
            "PRE_RIDE_VERIFICATION_COMPLETE",
            "PINMYFIVE_TRIGGERED",
            "ANOMALY_DETECTED",
            "USER_TAPPED_FEELS_UNSAFE"
        ]),
        actions: Object.freeze([
            "CONTINUOUS_ROUTE_WATCH",
            "REALTIME_RISK_SCORING",
            "SENTIMENT_CHECK_ON_RIDER_INPUT",
            "OFFER_SAFE_STOP_SUGGESTIONS",
            "OFFER_SWITCH_TOVOICE_WITH_ARI",
            "ESCALATE_TO_OVERSIGHT_ON_THRESHOLD"
        ]),
        pulseIntegration: Object.freeze({
            enabled: true,
            pulseChannel: "AIRS_SAFETY",
            emits: Object.freeze([
                "PULSE_AIRS_ROUTE_ANOMALY",
                "PULSE_AIRS_PINMYFIVE_ACTIVE",
                "PULSE_AIRS_EMERGENCY_LOCK",
                "PULSE_AIRS_SAFE_ARRIVAL"
            ])
        })
    }),

    // ---------------------------------------------------------
    // BIAS & NO-RACIAL-PROFILING GUARANTEES
    // ---------------------------------------------------------
    antiBiasLayer: Object.freeze({
        enabled: true,
        rules: Object.freeze({
            noRacialProfiling: true,
            noDiscriminationBy: Object.freeze([
                "race",
                "ethnicity",
                "religion",
                "gender",
                "orientation",
                "disability",
                "income"
            ]),
            humanOverrideConstraints: "Any human decision that introduces bias is void and quarantined.",
            auraAuditEnabled: true
        }),
        auditActions: Object.freeze([
            "LOG_ALL_SAFETY_DECISIONS_WITHOUT_PERSONAL_ATTRIBUTES",
            "RUN_AURA_ANTI_CORRUPTION_CHECKS",
            "ESCALATE_SUSPICIOUS_PATTERNS_TO_OVERSIGHT"
        ])
    }),

    // ---------------------------------------------------------
    // HOOKS FOR MODX SHIELD / ENFORCEMENT ENGINE
    // ---------------------------------------------------------
    enforcementHooks: Object.freeze({
        // Called by Shield / Hybrid engine with current state to know what to do
        allowedTransitions: Object.freeze([
            ["NORMAL", "ON_ALERT"],
            ["ON_ALERT", "PINMYFIVE"],
            ["PINMYFIVE", "EMERGENCY"],
            ["ON_ALERT", "EMERGENCY"],
            ["EMERGENCY", "QUARANTINE"],
            ["EMERGENCY", "ON_ALERT"], // de-escalation after safe resolution
            ["ON_ALERT", "NORMAL"]     // full ride completion and safety verification
        ]),
        freezeConditions: Object.freeze([
            "DRIVER_FLAGGED_FOR_ENDANGERMENT",
            "MULTIPLE_PINMYFIVE_IN_24H",
            "OVERSIGHT_HARD_LOCK_REQUEST"
        ]),
        notifySystems: Object.freeze([
            "MODX_SHIELD_CORE",
            "AURA_TWINS",
            "KZ_OVERSIGHT_MAP",
            "UNIVERSE_TELEMETRY",
            "COINPURSE_RISK_LAYER"
        ])
    })
});
