// © 2025 AIMAL Global Holdings | AIRS Safety Router
// -----------------------------------------------------------
// PUBLIC SAFETY API ENDPOINTS FOR AIRS RIDE SAFETY:
//
//  ✓ /stop            → Soft stop
//  ✓ /hard-stop       → Hard stop
//  ✓ /incident        → Incident logging
//  ✓ /redirect        → Safety redirect
//  ✓ /process         → Generic event processor (Batch A2)
//  ✓ /emergency-stop  → Manual emergency trigger
//
// Automatically integrates:
//   • Session-bound rideId creation
//   • SIT Safety Incident Log
//   • PQC hashing (AIRS safety events)
//   • AURA and MODLINK cross-system broadcasting
//   • Global safety state machine
// -----------------------------------------------------------

const express = require("express");
const router = express.Router();

const AIRSSafetyEngine = require("./airsSafetyEngine");

const AURA = global.AURA || null;
const MODLINK = global.MODLINK || null;

// -----------------------------
// Helper — ensure session object
// -----------------------------
function ensureSession(req) {
    if (!req.session) req.session = {};
    return req.session;
}

// =====================================================================
// 1️⃣ SOFT STOP
// =====================================================================
router.post("/stop", async (req, res) => {
    try {
        const session = ensureSession(req);
        const { twinId, location } = req.body;

        const result = await AIRSSafetyEngine.softStop(session, twinId, location);

        AURA?.broadcast("airs:softStop", result);
        MODLINK?.emit("airs:softStop", result);

        return res.json(result);
    } catch (err) {
        console.error("Soft Stop Error:", err);
        res.status(500).json({ error: "STOP_FAILED" });
    }
});

// =====================================================================
// 2️⃣ HARD STOP
// =====================================================================
router.post("/hard-stop", async (req, res) => {
    try {
        const session = ensureSession(req);
        const { twinId, location } = req.body;

        const result = await AIRSSafetyEngine.hardStop(session, twinId, location);

        AURA?.broadcast("airs:hardStop", result);
        MODLINK?.emit("airs:hardStop", result);

        res.json(result);
    } catch (err) {
        console.error("Hard Stop Error:", err);
        res.status(500).json({ error: "HARD_STOP_FAILED" });
    }
});

// =====================================================================
// 3️⃣ INCIDENT
// =====================================================================
router.post("/incident", async (req, res) => {
    try {
        const session = ensureSession(req);
        const { twinId, details, location } = req.body;

        const result = await AIRSSafetyEngine.incident(
            session,
            twinId,
            details,
            location
        );

        AURA?.broadcast("airs:incident", result);
        MODLINK?.emit("airs:incident", result);

        res.json(result);
    } catch (err) {
        console.error("Incident Error:", err);
        res.status(500).json({ error: "INCIDENT_FAILED" });
    }
});

// =====================================================================
// 4️⃣ REDIRECT
// =====================================================================
router.post("/redirect", async (req, res) => {
    try {
        const session = ensureSession(req);
        const { twinId, target, location } = req.body;

        const result = await AIRSSafetyEngine.redirect(
            session,
            twinId,
            target,
            location
        );

        AURA?.broadcast("airs:redirect", result);
        MODLINK?.emit("airs:redirect", result);

        res.json(result);
    } catch (err) {
        console.error("Redirect Error:", err);
        res.status(500).json({ error: "REDIRECT_FAILED" });
    }
});

// =====================================================================
// 5️⃣ GENERIC SAFETY EVENT PROCESSOR
// Batch A2 — handles all event types with SIT + PQC + state transitions
// =====================================================================
router.post("/process", async (req, res) => {
    try {
        const session = ensureSession(req);
        const event = req.body;

        // ensure rideId exists
        event.rideId = AIRSSafetyEngine.ensureRideId(session);

        const result = AIRSSafetyEngine.processEvent(event);

        AURA?.broadcast("airs:process", result);
        MODLINK?.emit("airs:process", result);

        res.json(result);
    } catch (err) {
        console.error("Process Error:", err);
        res.status(500).json({ error: "PROCESS_FAILED" });
    }
});

// =====================================================================
// 6️⃣ EMERGENCY STOP — highest level safety lockout
// =====================================================================
router.post("/emergency-stop", async (req, res) => {
    try {
        const session = ensureSession(req);
        const { twinId, location } = req.body;

        const signal = {
            level: "CRITICAL",
            type: "MANUAL_EMERGENCY",
            payload: {
                rideId: AIRSSafetyEngine.ensureRideId(session),
                twinId,
                location
            }
        };

        const result = AIRSSafetyEngine.triggerEmergencyStop(signal);

        AURA?.broadcast("airs:emergencyStop", result);
        MODLINK?.emit("airs:emergencyStop", result);

        res.json(result);
    } catch (err) {
        console.error("Emergency Stop Error:", err);
        res.status(500).json({ error: "EMERGENCY_STOP_FAILED" });
    }
});

// -----------------------------------------------------------
// EXPORT ROUTER
// -----------------------------------------------------------
module.exports = router;
