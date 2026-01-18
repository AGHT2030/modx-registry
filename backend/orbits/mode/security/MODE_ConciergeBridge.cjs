/**
 * © 2025 AG Holdings Trust | MODE Hospitality Bridge
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * PURPOSE:
 *   Bridge AIRS → MODE → MODA Hotel safe-haven protocol.
 *   Enables:
 *     • AI Concierge dispatch
 *     • Safe-Checkin workflow
 *     • Victim-rescue private entry
 *     • Twins as on-site coordinators
 *     • Hospitality intake without exposure
 *     • MODE event/venue coordination (weddings, corporate, nightlife)
 *
 * Protected under USPTO filings:
 *   - MODX Orbital OS
 *   - AURA Twins System
 *   - MODE Hybrid Orbital Module
 *   - MODA Hotel Digital Infrastructure
 */

const TwinOracle = require("../../../core/twins/TwinOracle.js").TwinOracle;
const TwinSafetyLogs = require("../../move/airs/AIRS_TwinSafetyLogs.cjs");
const SafeZones = require("../../move/airs/AIRS_SafeZoneRegistry.cjs");

// ------------------------------------------------------------
// 🏨 MODE Concierge Bridge
// ------------------------------------------------------------
module.exports = {
    /**
     * Trigger MODE concierge workflow whenever AIRS sends a safe-zone or hospitality request.
     *
     * @param {Object} ctx
     *    - userId
     *    - safeRoute
     *    - reason ("victim_rescue", "late_checkin", "vip_arrival")
     *    - region
     *    - riskLevel
     *    - twin (optional override)
     */
    async coordinate(ctx = {}) {
        const {
            userId,
            safeRoute,
            reason = "standard",
            region = "US",
            riskLevel = "unknown",
            twin = null
        } = ctx;

        // 1️⃣ Call correct Twin instance
        const assignedTwin =
            twin || TwinOracle.assignConciergeTwin({ userId, reason, region });

        // 2️⃣ Log concierge activation (ephemeral log for privacy)
        TwinSafetyLogs.logEvent("MODE_CONCIERGE_ACTIVATED", {
            userId,
            safeRoute,
            reason,
            region,
            twin: assignedTwin.id,
            riskLevel
        });

        // 3️⃣ Determine hospitality entry mode
        let entryMode = "standard";

        if (reason === "victim_rescue") {
            entryMode = "private_safe_entry";
        } else if (reason === "vip_arrival") {
            entryMode = "vip_lane";
        }

        // 4️⃣ Pull nearest MODA Hotel / partner safe haven
        const nearestSafeHotel = SafeZones.findNearestHotel(safeRoute);

        // 5️⃣ Prepare "pre-arrival digital room"
        const roomAssignment = {
            hotelId: nearestSafeHotel?.id || "MODA-HQ",
            roomType:
                reason === "victim_rescue"
                    ? "private-protected"
                    : reason === "vip_arrival"
                        ? "vip-suite"
                        : "standard-room",
            digitalKeyIssued: true,
            keyCode: SafeZones.generateEphemeralRouteCode(10)
        };

        // 6️⃣ Build concierge directives for AURA Twins
        const directives = {
            twinId: assignedTwin.id,
            actions: [
                {
                    type: "notify_user",
                    message:
                        reason === "victim_rescue"
                            ? "You are safe. I'm guiding you to your private entrance now."
                            : "Welcome! I’m preparing your arrival details."
                },
                {
                    type: "hotel_prep",
                    hotelId: roomAssignment.hotelId,
                    roomType: roomAssignment.roomType,
                    entryMode
                },
                {
                    type: "digital_key",
                    keyCode: roomAssignment.keyCode
                }
            ]
        };

        // 7️⃣ Return payload back to AIRS + MODE + GalaxyRouter
        return {
            status: "MODE_CONCIERGE_READY",
            twin: assignedTwin,
            safeRoute,
            hotel: nearestSafeHotel,
            roomAssignment,
            entryMode,
            directives
        };
    }
};
