/**
 * © 2025 AG Holdings Trust | AIRS Safe-Zone Registry
 * Option C: Adaptive jurisdictions, sealed trustee vault + ephemeral twin logs
 */

const crypto = require("crypto");

const SAFEZONE_ROTATION_MS = 5 * 60 * 1000; // 5-minute safety code refresh

// ---------------------------------------------------------
// 🔐 SAFE ZONES (MODA Hotel + NGO Network + Verified Partners)
// ---------------------------------------------------------
let safeZones = [
    {
        id: "moda-hotel-memphis",
        name: "MODA Hotel – Memphis",
        type: "MODA_SAFE",
        lat: 35.144,
        lng: -90.052,
        acceptEmergency: true
    },
    {
        id: "local-dv-shelter-1",
        name: "DV SafeHouse Partner 1",
        type: "NGO_PARTNER",
        lat: 35.12,
        lng: -90.04,
        acceptEmergency: true
    }
];

// ---------------------------------------------------------
// 🔐 Rotating escape codes (victim-only, twin-validated)
// ---------------------------------------------------------
let currentCode = generateCode();
let expiresAt = Date.now() + SAFEZONE_ROTATION_MS;

function generateCode() {
    return crypto.randomBytes(3).toString("hex"); // 6-digit hex safe phrase
}

// Rotates every 5 minutes
function rotateCode() {
    const now = Date.now();
    if (now > expiresAt) {
        currentCode = generateCode();
        expiresAt = now + SAFEZONE_ROTATION_MS;
    }
    return currentCode;
}

module.exports = {
    rotateCode,
    safeZones,
    getActiveCode: () => currentCode,
    getZones: () => safeZones
};
