/**
 * © 2025 AG Holdings Trust | AIRS × AURA Whisper Intelligence Bridge
 * PROPRIETARY — UNLICENSED — PATENT PENDING
 *
 * WhisperAIRSAdapter
 * -------------------
 * Bridges:
 *   - AIRS (AI Roadside Intelligence System)
 *   - AURA Whisper Engine (Tier 1, 2, 3)
 *   - Pin-My-Five Emergency Network
 *   - HybridConsciousnessEngine
 *   - Oversite Risk Heatmap
 *   - User Universe Builder (orb preference signals)
 *
 * Handles:
 *   - Real-time vehicle signals
 *   - Roadside anomalies
 *   - Geo-threat detection
 *   - Behavior patterns for user’s personal universe
 *   - Tiered whisper escalation (Soft → Habit → Critical)
 */

const EventEmitter = require("events");
const axios = require("axios");
const geoRisk = require("../risk/geoRiskEngine");
const pm5 = require("../safety/PinMyFiveCore");
const { sendWhisper } = require("../whispers/WhisperEngine");
const { updateUserUniverse } = require("../universe/UniversePreferenceEngine");
const { logOversite } = require("../oversite/OversiteLog");

/* -----------------------------------------------------------------------
   MAIN CLASS
------------------------------------------------------------------------ */
class WhisperAIRSAdapter extends EventEmitter {
    constructor() {
        super();

        this.vehicleState = {
            speed: 0,
            braking: false,
            collisionRisk: 0,
            engineHealth: 100,
            tirePressure: 100,
            gps: null,
        };
    }

    /* -------------------------------------------------------------------
       INGEST: RAW VEHICLE + ENVIRONMENT DATA
    ------------------------------------------------------------------- */
    ingest(telemetry) {
        if (!telemetry) return;

        // Update internal state
        this.vehicleState = { ...this.vehicleState, ...telemetry };

        // AUTO-PROCESS the combined state
        this._processState();
    }

    /* -------------------------------------------------------------------
       PRIVATE: PROCESS SENSOR + HUMAN BEHAVIOR
    ------------------------------------------------------------------- */
    async _processState() {
        const s = this.vehicleState;

        const risk = await geoRisk.evaluate(s.gps);
        const collisionWarn = s.collisionRisk > 0.45;
        const hardBrake = s.braking === true;
        const lowTire = s.tirePressure < 65;
        const lowEngine = s.engineHealth < 40;

        /* =============================================================
           TIER 1 WHISPERS — Comfort / Lifestyle / Convenience
        =============================================================== */
        if (risk.weather === "rain" && !hardBrake) {
            sendWhisper({
                tier: 1,
                message: "Rain detected ahead—should I warm or prep the vehicle cabin for comfort?",
                orb: "STAY",
                context: "weather",
            });
        }

        if (risk.traffic === "heavy") {
            sendWhisper({
                tier: 1,
                message: "Traffic is building—would you like a faster alternate route?",
                orb: "MOVE",
                context: "traffic",
            });
        }

        /* =============================================================
           TIER 2 WHISPERS — Habit, Pattern, Universe Growth
        =============================================================== */
        if (risk.safe && s.speed < 7) {
            updateUserUniverse("MOVE");  // preference signal

            sendWhisper({
                tier: 2,
                message: "You’re frequently using MOVE during this time—shall I mark it as a primary orb in your universe?",
                orb: "MOVE",
                context: "habit",
            });
        }

        if (s.engineHealth < 70 && s.engineHealth > 50) {
            sendWhisper({
                tier: 2,
                message: "Engine performance slightly reduced—would you like maintenance recommendations?",
                orb: "HEAL",
                context: "vehicle-health",
            });
        }

        /* =============================================================
           TIER 3 WHISPERS — CRITICAL SAFETY ALERTS
        =============================================================== */
        if (collisionWarn || hardBrake) {
            sendWhisper({
                tier: 3,
                message: "Potential collision detected—activating enhanced awareness mode.",
                orb: "MOVE",
                context: "safety",
            });

            pm5.triggerIfNeeded({
                event: "collision_risk",
                severity: "HIGH",
                gps: s.gps,
            });

            // Log into Oversite Council System
            logOversite({
                type: "CRITICAL_EVENT",
                module: "AIRS",
                details: { collisionWarn, hardBrake, gps: s.gps },
            });
        }

        if (lowTire || lowEngine) {
            sendWhisper({
                tier: 3,
                message: `Critical ${lowTire ? "tire pressure" : "engine"} issue detected. Activate emergency support?`,
                orb: "HEAL",
                context: "critical-vehicle",
            });

            pm5.triggerIfNeeded({
                event: "vehicle_failure",
                gps: s.gps,
                severity: "CRITICAL",
            });
        }
    }
}

module.exports = new WhisperAIRSAdapter();
