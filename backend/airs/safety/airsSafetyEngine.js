// © 2025 AIMAL Global Holdings | AIRS Ride Safety Engine
// ------------------------------------------------------
// Handles:
//  • Soft Stop
//  • Hard Stop (immediate halt)
//  • Emergency Incident
//  • Redirect (police, hotel, safe zone)
//  • Telemetry capture
//  • SIT + PQC hashing
//  • MODLINK + AURA safety sync (activated in Batch A2)
//  • Safety signal validation + state machine
//  • Immutable audit logging
//  • Emergency Stop routing to global safety state

const sitLog = require("../../sit/sitIncidentLog");
const pqc = require("../../security/pqc/pqcSafety");
const SafetyEvents = require("./airsSafetyEvents");
let uuidv4;

(async () => {
    try {
        const { v4 } = await import("uuid");
        uuidv4 = v4;
        console.log("🆔 UUID v4 initialized (ESM-safe)");
    } catch (err) {
        console.warn("⚠️ UUID unavailable — using fallback", err.message);
        uuidv4 = () => `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
})();

// 🔐 Batch A2 core modules
const safetySignals = require("./airsSafetySignals");
const safetyState = require("./airsSafetyState");
const audit = require("./airsSafetyAuditLog");

class AIRSSafetyEngine {

    /**
     * Initialize a new rideId if one does not exist.
     */
    static ensureRideId(session) {
        if (!session.rideId) {
            session.rideId = uuidv4();
        }
        return session.rideId;
    }

    /**
     * SOFT STOP — controlled deceleration, non-emergency.
     */
    static async softStop(session, twinId, location) {
        const rideId = this.ensureRideId(session);

        const event = SafetyEvents.buildEvent({
            rideId,
            twinId,
            severity: "LOW",
            action: "STOP",
            location
        });

        event.pqcHash = pqc.hashEvent("AIRS_STOP", event);
        await sitLog.write(event);

        // Also push into safety state + audit stream
        audit.log("SOFT_STOP", { rideId, twinId, location });
        safetyState.update({
            level: "INFO",
            type: "SOFT_STOP",
            payload: { rideId, twinId, location }
        });

        return {
            status: "STOPPED",
            rideId,
            event
        };
    }

    /**
     * HARD STOP — immediate halt, hazard detected.
     */
    static async hardStop(session, twinId, location) {
        const rideId = this.ensureRideId(session);

        const event = SafetyEvents.buildEvent({
            rideId,
            twinId,
            severity: "HIGH",
            action: "HARD_STOP",
            location
        });

        event.pqcHash = pqc.hashEvent("AIRS_HARD_STOP", event);
        await sitLog.write(event);

        // Push into safety state + audit
        audit.log("HARD_STOP", { rideId, twinId, location });
        safetyState.update({
            level: "ALERT",
            type: "HARD_STOP",
            payload: { rideId, twinId, location }
        });

        return {
            status: "HARD_STOPPED",
            rideId,
            event
        };
    }

    /**
     * INCIDENT — reports a safety or behavioral incident.
     * Examples:
     *  - driver issue
     *  - threat nearby
     *  - passenger feels unsafe
     *  - mechanical fault
     */
    static async incident(session, twinId, details, location) {
        const rideId = this.ensureRideId(session);

        const event = SafetyEvents.buildEvent({
            rideId,
            twinId,
            severity: details.severity || "MEDIUM",
            action: "INCIDENT",
            location,
            details
        });

        event.pqcHash = pqc.hashEvent("AIRS_INCIDENT", event);
        await sitLog.write(event);

        audit.log("INCIDENT_RECORDED", { rideId, twinId, details, location });
        safetyState.update({
            level: details.level || "WARN",
            type: "INCIDENT",
            payload: { rideId, twinId, details, location }
        });

        return {
            status: "INCIDENT_RECORDED",
            rideId,
            event
        };
    }

    /**
     * REDIRECT — re-route ride to a safer location or emergency hub.
     */
    static async redirect(session, twinId, target, location) {
        const rideId = this.ensureRideId(session);

        const event = SafetyEvents.buildEvent({
            rideId,
            twinId,
            severity: "MEDIUM",
            action: "REDIRECT",
            location,
            target
        });

        event.pqcHash = pqc.hashEvent("AIRS_REDIRECT", event);
        await sitLog.write(event);

        audit.log("REDIRECT", { rideId, twinId, target, location });
        safetyState.update({
            level: "ALERT",
            type: "REDIRECT",
            payload: { rideId, twinId, target, location }
        });

        return {
            status: "REDIRECTING",
            rideId,
            event
        };
    }

    // ------------------------------------------------------
    // 🔁 Batch A2: Generic safety event processor
    // ------------------------------------------------------

    /**
     * Process a generic safety event (from sensors, app, AI, XRPL, etc.)
     * Routes through validator + state machine + audit log.
     */
    static processEvent(event) {
        audit.log("PROCESS_EVENT", event);

        // 1. Validate incoming signal
        const signal = safetySignals.validate(event);
        if (!signal.valid) {
            audit.log("INVALID_SIGNAL", { event, reason: signal.reason });
            return { status: "rejected", reason: signal.reason };
        }

        // 2. Update safety state
        const newState = safetyState.update(signal);
        audit.log("STATE_UPDATED", newState);

        // 3. Handle critical events as Emergency Stop
        if (signal.level === "CRITICAL") {
            audit.log("EMERGENCY_TRIGGER", signal);
            return this.triggerEmergencyStop(signal);
        }

        return {
            status: "ok",
            state: newState
        };
    }

    /**
     * Centralized Emergency Stop logic.
     * Uses safetyState + SIT log + PQC hashing + audit.
     */
    static triggerEmergencyStop(signal) {
        const resultState = safetyState.set("EMERGENCY_STOP");

        const event = SafetyEvents.buildEvent({
            rideId: signal?.payload?.rideId || null,
            twinId: signal?.payload?.twinId || null,
            severity: "CRITICAL",
            action: "EMERGENCY_STOP",
            location: signal?.payload?.location,
            details: signal
        });

        event.pqcHash = pqc.hashEvent("AIRS_EMERGENCY_STOP", event);

        // Fire-and-forget write — do not block emergency response on I/O
        Promise.resolve()
            .then(() => sitLog.write(event))
            .catch(err => {
                console.error("AIRS SAFETY: failed to persist EMERGENCY_STOP", err);
            });

        audit.log("EMERGENCY_STOP_ACTIVATED", {
            signal,
            resultState,
            timestamp: Date.now()
        });

        return {
            status: "emergency",
            message: "Emergency Stop Activated",
            state: resultState,
            event
        };
    }
}

module.exports = AIRSSafetyEngine;
