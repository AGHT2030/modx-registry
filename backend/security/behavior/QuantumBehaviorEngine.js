
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
 * © 2025 Mia Lopez | Quantum Behavioral Engine (QBE-2)
 *
 * Purpose:
 *  - Creates QBI (Quantum Behavioral Identity)
 *  - Learns user behavioral rhythm over time
 *  - Reinforces or mutates security genome based on anomalies
 *  - Feeds anomaly signals back into the Black Hole Network (A–E)
 */

const crypto = require("crypto");
const { ingestGenomeEvent } = require("../genome/SecurityGenomeRouter");

/* ----------------------------------------------------------
   Utility: SHA256 Hash
----------------------------------------------------------- */
function sha256(x) {
    return crypto.createHash("sha256").update(x).digest("hex");
}

/* ----------------------------------------------------------
   Extract Timing Signature
----------------------------------------------------------- */
function extractTimingSignature(events) {
    if (!events || events.length === 0) return "0";

    const gaps = [];
    for (let i = 1; i < events.length; i++) {
        gaps.push(events[i].t - events[i - 1].t);
    }

    const avgGap =
        gaps.reduce((a, b) => a + b, 0) / (gaps.length || 1);

    return sha256("TIMING-" + avgGap);
}

/* ----------------------------------------------------------
   Extract Motion Vector (gyroscope / accel)
----------------------------------------------------------- */
function extractMotionVector(motionData) {
    if (!motionData) return "0";

    const magnitude = Math.sqrt(
        motionData.x ** 2 + motionData.y ** 2 + motionData.z ** 2
    );

    return sha256("MOTION-" + magnitude);
}

/* ----------------------------------------------------------
   Extract Interaction Gravity (how user flows through UI)
----------------------------------------------------------- */
function extractInteractionGravity(scrollData, clickData) {
    const scrollScore =
        (scrollData?.totalScroll || 1) *
        (scrollData?.velocity || 1);

    const clickRhythm =
        (clickData?.clicks || 1) *
        (clickData?.avgPressure || 1);

    return sha256("GRAVITY-" + scrollScore + "-" + clickRhythm);
}

/* ----------------------------------------------------------
   Generate QBI (Quantum Behavioral Identity)
----------------------------------------------------------- */
function generateQBI(behaviorPacket) {
    const timingSig = extractTimingSignature(behaviorPacket.timing);
    const motionSig = extractMotionVector(behaviorPacket.motion);
    const gravitySig = extractInteractionGravity(
        behaviorPacket.scroll,
        behaviorPacket.click
    );

    const combined = timingSig + motionSig + gravitySig;

    const QBI = sha256("QBI-" + combined);

    ingestGenomeEvent({
        type: "QBI_update",
        severity: "LOW",
        vector: "behavior_learning",
        metadata: { timingSig, motionSig, gravitySig }
    });

    return { QBI, timingSig, motionSig, gravitySig };
}

/* ----------------------------------------------------------
   Validate QBI
----------------------------------------------------------- */
function validateQBI(behaviorPacket, knownQBI) {
    const newQBI = generateQBI(behaviorPacket).QBI;

    const isMatch = newQBI === knownQBI;

    ingestGenomeEvent({
        type: isMatch ? "QBI_match" : "QBI_anomaly",
        severity: isMatch ? "LOW" : "CRITICAL",
        vector: "behavior_validation",
        metadata: { knownQBI, newQBI }
    });

    return { isMatch, newQBI };
}

module.exports = {
    generateQBI,
    validateQBI
};
