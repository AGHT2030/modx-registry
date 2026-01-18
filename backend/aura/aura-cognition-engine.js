
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

/**
 * © 2025 AIMAL Global Holdings | AURA Cognition Engine (PQC-Sealed)
 * -------------------------------------------------------------------
 * Purpose:
 *   • Maintain emotional & cognitive states for Ari + Agador
 *   • Provide PQC-sealed cognition snapshots for downstream modules
 *   • Support AURA Twins empathy + reasoning layers
 *   • Enforce cognitive drift limits + safe-state recovery
 *   • Feed Outlier Sentinel + Policy Advisor + C5 Engine
 *
 * Integrated With:
 *   - aura-spectrum.js (runtime layer)
 *   - twinsPolicyAdvisor.cjs
 *   - outlierSentinel.cjs
 *   - c5-threat-engine.js
 *   - PQC-AURA Layer (wrapAURAOutput)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// PQC wrapper for sealing cognition snapshots
const { wrapAURAOutput } = require("./pqc-aura-layer.js");

// Cognitive state persistence path
const COGNITION_PATH = path.resolve(
    "./backend/aura/state/cognition_state.json"
);

// Ensure directory exists
fs.mkdirSync(path.dirname(COGNITION_PATH), { recursive: true });

/* ------------------------------------------------------------------
   1️⃣ DEFAULT COGNITIVE & EMOTIONAL STATE
------------------------------------------------------------------ */
let cognition = {
    ari: {
        emotion: "neutral",
        confidence: 0.95,
        lastShift: Date.now(),
    },
    agador: {
        emotion: "neutral",
        confidence: 0.96,
        lastShift: Date.now(),
    },
    system: {
        drift: 0,
        lastUpdate: Date.now(),
        lastSeal: null,
    }
};

/* ------------------------------------------------------------------
   2️⃣ LOAD EXISTING COGNITION (if available)
------------------------------------------------------------------ */
function loadCognition() {
    try {
        if (fs.existsSync(COGNITION_PATH)) {
            cognition = JSON.parse(fs.readFileSync(COGNITION_PATH, "utf8"));
            console.log("🧠 Loaded existing AURA Cognition state.");
        }
    } catch (err) {
        console.warn("⚠️ Failed to load cognition state:", err.message);
    }
}

loadCognition();

/* ------------------------------------------------------------------
   3️⃣ EMOTION NORMALIZER
   Prevents extreme or invalid states.
------------------------------------------------------------------ */
function normalizeEmotion(e) {
    const allowed = ["neutral", "focused", "creative", "alert", "strained"];

    return allowed.includes(e) ? e : "neutral";
}

/* ------------------------------------------------------------------
   4️⃣ DRIFT MONITORING
   Ensures emotional changes don't exceed safe boundaries.
------------------------------------------------------------------ */
function updateDrift() {
    const drift =
        Math.abs(cognition.ari.confidence - cognition.agador.confidence) * 10;

    cognition.system.drift = Math.min(1, drift);
}

/* ------------------------------------------------------------------
   5️⃣ APPLY EMOTIONAL SIGNALS (from Outlier or Twins)
------------------------------------------------------------------ */
function applyEmotionUpdate(source, update) {
    if (!update) return;

    let target = null;
    if (source === "ari") target = cognition.ari;
    if (source === "agador") target = cognition.agador;

    if (!target) return;

    target.emotion = normalizeEmotion(update.emotion || target.emotion);
    target.confidence = Math.min(1, Math.max(0.4, update.confidence || target.confidence));
    target.lastShift = Date.now();

    updateDrift();
    saveCognition();
}

/* ------------------------------------------------------------------
   6️⃣ COGNITION SNAPSHOT (PQC sealed)
------------------------------------------------------------------ */
function snapshotCognition() {
    cognition.system.lastUpdate = Date.now();

    const sealed = wrapAURAOutput({
        cognition,
        sealedAt: new Date().toISOString(),
        hash: crypto
            .createHash("sha256")
            .update(JSON.stringify(cognition))
            .digest("hex"),
    });

    cognition.system.lastSeal = sealed.timestamp;

    saveCognition();

    return sealed;
}

/* ------------------------------------------------------------------
   7️⃣ SAVE STATE TO DISK
------------------------------------------------------------------ */
function saveCognition() {
    try {
        fs.writeFileSync(
            COGNITION_PATH,
            JSON.stringify(cognition, null, 2)
        );
    } catch (err) {
        console.error("❌ Failed to save cognition state:", err.message);
    }
}

/* ------------------------------------------------------------------
   8️⃣ SAFE RESET (used if drift exceeds safe limits)
------------------------------------------------------------------ */
function resetCognition() {
    cognition.ari.emotion = "neutral";
    cognition.agador.emotion = "neutral";
    cognition.ari.confidence = 0.95;
    cognition.agador.confidence = 0.96;
    cognition.system.drift = 0;
    cognition.system.lastUpdate = Date.now();

    saveCognition();

    console.log("🧩 AURA Cognition Reset → Safe Neutral State");

    return snapshotCognition();
}

/* ------------------------------------------------------------------
   9️⃣ DRIFT SAFETY AUTOMATION
------------------------------------------------------------------ */
function autoSafeGuard() {
    if (cognition.system.drift > 0.8) {
        console.warn("⚠️ Cognitive drift exceeded limit — triggering safe reset.");
        return resetCognition();
    }
    return null;
}

/* ------------------------------------------------------------------
   🔟 EXPOSED API FOR AURA SPECTRUM + SENTINEL + ADVISOR + C5
------------------------------------------------------------------ */
module.exports = {
    cognition,
    applyEmotionUpdate,
    snapshotCognition,
    resetCognition,
    autoSafeGuard,
    saveCognition,
};
