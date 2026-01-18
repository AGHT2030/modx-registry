/**
 * © 2025 AG Holdings Trust | AIRS Sovereign Safety Layer
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * Adaptive Cloak Mode (Option C)
 * - Full cloak for victim rescue
 * - Partial cloak for legal/partner requirements
 * - Twin-verified routing
 * - Safe-Zone restricted navigation
 * - PINMYFIVE preflight authentication
 * - MODX Shield emergency override
 * - 5-minute rotating safe-route codes
 * - MODE + MODA Safe Hotel rescue escalation
 */

const SafeZoneRegistry = require("./AIRS_SafeZoneRegistry.cjs");
const TwinSafetyLogs = require("./AIRS_TwinSafetyLogs.cjs");
const HotelBridge = require("./AIRS_SafeHotelBridge.cjs");

module.exports = {
    async apply(req) {

        // ----------------------------------------------------------
        // 0️⃣  PINMYFIVE — Passenger identity pre-flight validation
        // ----------------------------------------------------------
        if (!req.skipPINCheck) {
            const pinVerified = await TwinSafetyLogs.verifyPINMYFIVE(
                req.userId,
                req.pin
            );

            if (!pinVerified) {
                // Identity NOT verified → immediate halt
                TwinSafetyLogs.logEvent("PINMYFIVE_FAILURE", req);

                return {
                    denied: true,
                    reason: "Invalid PINMYFIVE",
                    cloaked: false,
                    routeVisibleTo: ["MODX_SHIELD"]
                };
            }

            TwinSafetyLogs.logEvent("PINMYFIVE_VERIFIED", req);
        }

        // ----------------------------------------------------------
        // 1️⃣  MODX SHIELD EMERGENCY COMMAND (Option B)
        // ----------------------------------------------------------
        if (req.forceOverride === true) {
            TwinSafetyLogs.logEvent("MODX_SHIELD_OVERRIDE", req);

            return {
                ...req,
                cloaked: true,
                overrideBy: "MODX_SHIELD",
                routeVisibleTo: ["MODX_SHIELD", "AURA"],   // AURA only for oversight
                twinOnlyLog: true
            };
        }

        // ----------------------------------------------------------
        // 2️⃣  VICTIM RESCUE MODE — Full Cloak (Option C)
        // ----------------------------------------------------------
        if (req.mode === "victim_rescue") {

            // ➤ Safe Zone selection
            const safeRoute = SafeZoneRegistry.findNearestSafeZone(req.location);

            // ➤ 5-minute regeneration access code (cloaked)
            const ephemeralCode = SafeZoneRegistry.generateEphemeralRouteCode(5);

            // ➤ Twin-only ephemeral log + trustee vault seal
            TwinSafetyLogs.logVictimRescue({
                userId: req.userId,
                safeRoute,
                ephemeralCode,
                sealMode: "DUAL" // ephemeral + trustee vault
            });

            // ➤ MODE → MODA Safe Hotel auto-check-in
            await HotelBridge.preRegisterSafeCheckin({
                userId: req.userId,
                safeZoneId: safeRoute.id
            });

            return {
                ...req,
                safeRoute,
                cloaked: true,
                victimMode: true,
                ephemeralCode,
                restrictedToSafeZones: true,

                // Visibility:
                //  - NOT visible to drivers
                //  - NOT visible to partners
                //  - AURA + MODX Shield only
                routeVisibleTo: ["MODX_SHIELD", "AURA"],

                twinOnlyLog: true
            };
        }

        // ----------------------------------------------------------
        // 3️⃣  PARTNER VISIBILITY (legal + franchise requirement)
        // ----------------------------------------------------------
        if (req.partnerVisible) {
            TwinSafetyLogs.logEvent("PARTNER_CLOAK", req);

            return {
                ...req,
                cloaked: "partial",
                restrictedToSafeZones: false,
                routeVisibleTo: ["MODX_SHIELD", "AIRS_PARTNER"]
            };
        }

        // ----------------------------------------------------------
        // 4️⃣  DEFAULT “STANDARD” CLOAK HANDLING
        // ----------------------------------------------------------
        TwinSafetyLogs.logEvent("STANDARD_AIRS_ROUTE", req);

        return {
            ...req,
            cloaked: false,
            routeVisibleTo: ["MODX_SHIELD", "AURA"], // Shield always oversees
            restrictedToSafeZones: false
        };
    }
};
