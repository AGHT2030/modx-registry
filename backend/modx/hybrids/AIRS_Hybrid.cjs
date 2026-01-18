/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * AIRS Hybrid Adapter (MOVE Galaxy)
 * - Normal rideshare
 * - Safe-Zone Rescue (abuse victims)
 * - PINMYFIVE panic protocol
 * - AI Rescue with AURA + MODX Shield command
 */

const { ORBITAL_TREE } = require("../../orbitals/orbital_tree.cjs");
const { PULSE_BPE } = require("../../pulse/PULSE_BPE.js");
const { MODX_Shield } = require("../../security/shield/MODX_Shield.cjs");
const { AIRS_Shield } = require("../../security/shield/AIRS_Shield.cjs");
const { TwinsSafeLog } = require("../../aura/TwinsSafeLog.cjs");
const { TrusteeVault } = require("../../trust/TrusteeVault.cjs");
const { broadcastTwinEvent } = require("../../universe/UniverseTelemetry.js");

function resolveMoveRoute(mode) {
    const moveRouting = ORBITAL_TREE.routing.MOVE;
    if (!moveRouting) return null;

    const key = mode || "standardRide";
    return moveRouting.routes[key] || moveRouting.routes.standardRide;
}

/**
 * Core AIRS hybrid entry point.
 *
 * @param {Object} event
 * {
 *   mode: "standardRide" | "safeZoneRescue" | "pinMyFivePanic" | "aiRescue",
 *   passengerId,
 *   twinId,
 *   location,
 *   destination,
 *   safeZoneId?,
 *   countryCode?,
 *   riskFlags?,
 *   meta?
 * }
 */
async function runAIRS(event = {}) {
    const { mode = "standardRide" } = event;
    const routeMeta = resolveMoveRoute(mode);

    if (!routeMeta) {
        throw new Error(`AIRS_Hybrid: Unknown MOVE mode "${mode}"`);
    }

    // 🔐 Step 1: Ask MODX Shield if operation is allowed
    const shieldDecision = MODX_Shield.evaluate({
        galaxy: "MOVE",
        hybrid: "AIRS",
        lane: routeMeta.lane,
        event
    });

    if (!shieldDecision.allowed) {
        // Log to AURA + Twins
        broadcastTwinEvent({
            type: "AIRS_BLOCKED",
            reason: shieldDecision.reason || "MODX_Shield_block",
            lane: routeMeta.lane,
            mode,
            timestamp: Date.now()
        });

        return {
            ok: false,
            blockedBy: "MODX_Shield",
            reason: shieldDecision.reason || "Policy violation"
        };
    }

    // 🎭 Step 2: Apply AIRS-specific safety policy (Safe-Zone, PINMYFIVE, etc.)
    const safetyResult = AIRS_Shield.enforce({
        mode,
        lane: routeMeta.lane,
        event
    });

    if (!safetyResult.ok) {
        return {
            ok: false,
            blockedBy: "AIRS_Shield",
            reason: safetyResult.reason || "AIRS safety policy block"
        };
    }

    // 🕵️ Step 3: Adaptive Cloak Mode for routes
    const cloakProfile = AIRS_Shield.getCloakProfile({
        mode,
        countryCode: event.countryCode,
        riskFlags: event.riskFlags || []
    });

    // ✍️ Step 4: Twin-only ephemeral log + sealed trustee vault (Option C)
    try {
        TwinsSafeLog.ephemeralWrite({
            kind: "AIRS_EVENT",
            mode,
            lane: routeMeta.lane,
            passengerId: event.passengerId,
            twinId: event.twinId,
            timestamp: Date.now(),
            cloakProfile: cloakProfile.level
        });

        // For liability + audit, store sealed hash in Trustee Vault
        TrusteeVault.appendSealedRecord("AIRS", {
            mode,
            lane: routeMeta.lane,
            passengerId: event.passengerId,
            safeZoneId: event.safeZoneId || null,
            timestamp: Date.now()
        });
    } catch (err) {
        console.error("AIRS_Hybrid: logging error", err.message);
    }

    // 📡 Step 5: Broadcast to Universe Telemetry for MOVE-HYBRID routing trace
    broadcastTwinEvent({
        type: "MOVE_HYBRID_ROUTE",
        hybrid: "AIRS",
        lane: routeMeta.lane,
        mode,
        passengerId: event.passengerId,
        safeZoneId: event.safeZoneId || null,
        timestamp: Date.now()
    });

    // ⚙️ Step 6: Invoke Pulse Engine with enriched payload
    const enrichedEvent = {
        ...event,
        galaxy: "MOVE",
        hybrid: "AIRS",
        lane: routeMeta.lane,
        cloakProfile,
        shieldDecision
    };

    const activation = await PULSE_BPE.generateActivation(enrichedEvent);

    return {
        ok: true,
        mode,
        lane: routeMeta.lane,
        cloakProfile,
        activation
    };
}

module.exports = {
    runAIRS
};
