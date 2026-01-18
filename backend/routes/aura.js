// © 2025 AG Holdings Trust | AURA Drift + Trustee Verification Pipeline
// Fully Integrated TSS-8, TSS-9, Neural TIF, C5, Quantum Sentinel, Router Propagation

const express = require("express");
const router = express.Router();

const classifyDrift = require("../aura/drift/AuraDriftEngine.cjs");
const sequencedChallenge = require("../aura/drift/ChallengeSequencer.cjs");

const TIF = require("../aura/tif/TIF_NeuralModel.cjs");            // ⭐ Upgraded TIF Neural Model
const C5 = require("../sentinel/C5_Engine.cjs");
const C5Propagation = require("../sentinel/C5_RouterPropagation.cjs");
const QuantumSentinel = require("../sentinel/QuantumSentinel.cjs");

// -----------------------------------------------------------
//  Trustee Presence + Verification Pipeline
// -----------------------------------------------------------
router.post("/presence", async (req, res) => {
    const { idleMs, windowFocused, cadenceScore, entropy = 0 } = req.body;

    // -------------------------------------------------------
    // 1) Drift Classification (Idle + Focus + Cadence)
    // -------------------------------------------------------
    const drift = classifyDrift({
        idleMs,
        cadenceScore,
        windowFocused
    });

    // -------------------------------------------------------
    // 2) TIF Neural Model Fingerprint Match
    // -------------------------------------------------------
    const fpMatch = await TIF.evaluate(req.user, {
        idleMs,
        cadenceScore,
        entropy,
        focus: windowFocused ? 1 : 0
    });

    // Always continue updating the model (learning)
    await TIF.train(req.user, {
        idleMs,
        cadenceScore,
        entropy,
        focus: windowFocused ? 1 : 0
    });

    // -------------------------------------------------------
    // 3) Sentinel C5 Threat Engine Evaluation
    // -------------------------------------------------------
    const threat = C5.evaluate({
        drift,
        fpMatch,
        unauthorized: global.UNAUTH_COUNT || 0,
        govEvents: global.GOV_EVENTS || 0,
    });

    // -------------------------------------------------------
    // 4) Propagate Threat to Universe Router State (OPTION N)
    // -------------------------------------------------------
    C5Propagation.apply(threat);

    // -------------------------------------------------------
    // 5) HIGH or CRITICAL Threat → Quantum Sentinel Countermeasures
    // -------------------------------------------------------
    if (threat === "HIGH" || threat === "CRITICAL") {
        const result = QuantumSentinel.engage(threat);

        console.warn(`🛑 Quantum Sentinel Activated — ${threat}`, {
            user: req.user.email,
            result
        });

        return res.json({
            status: "LOCKDOWN_REQUIRED",
            threatLevel: threat,
            message: "System security countermeasures have activated.",
            lockdown: true,
        });
    }

    // -------------------------------------------------------
    // 6) Non-normal Drift or Fingerprint mismatch → MFA Challenge
    // -------------------------------------------------------
    if (drift !== "NORMAL" || fpMatch !== "MATCH") {
        const challengePack = sequencedChallenge(req.user, drift);

        return res.json({
            status: "REAUTH_REQUIRED",
            drift,
            fpMatch,
            challenge: challengePack.challenge,
            level: challengePack.level
        });
    }

    // -------------------------------------------------------
    // 7) Everything Normal → OK
    // -------------------------------------------------------
    return res.json({
        status: "OK",
        drift,
        fpMatch,
        threat
    });
});

module.exports = router;
