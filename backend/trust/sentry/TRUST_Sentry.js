
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
 * © 2025 AIMAL Global Holdings | UNLICENSED
 * TRUST SENTRY — Real-Time Threat Detection Layer
 * ------------------------------------------------------------
 * Monitors:
 *  - abnormal routing
 *  - session spoof attempts
 *  - identity correlations
 *  - device entropy anomalies
 *  - geo-pattern scans
 *  - excessive API pressure
 *  - corporate reconnaissance attempts
 *
 * Works with:
 *  - QUASIBRID Identity Firewall
 *  - TRUST Privilege Matrix
 *  - TRUST Gatekeeper
 *  - PQC Integrity Layer
 */

const crypto = require("crypto");
const { privilegeTiers, emergencyProtocols } = require("../gatekeeper/TRUST_PrivilegeMatrix.js");

const ALERT_TYPES = {
    SPOOF: "session_spoof_attempt",
    CORRELATION: "identity_correlation_attempt",
    OVERREACH: "galaxy_privilege_violation",
    PATTERN: "geo_behavioral_pattern_attempt",
    PRESSURE: "api_pressure_spike",
    DEVICE: "device_entropy_anomaly"
};

// Internal anomaly state
const SentryState = {
    sessionMap: new Map(),     // token -> recentEvents[]
    pressureMap: new Map(),    // IP/Zone -> hit count
    deviceEntropy: new Map(),  // token -> entropy score
    geoPatterns: new Map()     // token -> last blurred zone
};

// ENTROPY CHECK — detect device fingerprinting
function detectDeviceEntropy(device = {}) {
    const keys = Object.keys(device || {});
    return keys.length; // low entropy = safer
}

// PRESSURE CHECK — detect rapid API crawls / botnets
function detectPressure(ipZone) {
    const now = Date.now();
    const record = SentryState.pressureMap.get(ipZone) || { count: 0, ts: now };

    if (now - record.ts < 400) {
        record.count += 1;
    } else {
        record.count = 1;
        record.ts = now;
    }

    SentryState.pressureMap.set(ipZone, record);
    return record.count > 25; // too many calls in <400ms window
}

// GEO PATTERN CHECK — detect triangulation attempts
function detectGeoPattern(token, blurredGeo) {
    if (!blurredGeo) return false;
    const last = SentryState.geoPatterns.get(token);
    SentryState.geoPatterns.set(token, blurredGeo.zone);
    return last && last !== blurredGeo.zone; // someone trying multi-zone correlation
}

// MAIN REAL-TIME SENTRY
module.exports = {
    analyzeSafeEvent(safeEvent = {}) {
        const token = safeEvent.token;
        const payload = safeEvent.payload || {};
        const flags = payload.flags || {};

        const anomalies = [];

        // ------------------------------
        // 1. DEVICE ENTROPY ANALYSIS
        // ------------------------------
        const entropy = detectDeviceEntropy(payload.device);
        SentryState.deviceEntropy.set(token, entropy);

        if (entropy > 3) {
            anomalies.push({
                type: ALERT_TYPES.DEVICE,
                severity: "medium",
                message: "High entropy detected — possible fingerprinting attempt."
            });
        }

        // ------------------------------
        // 2. API PRESSURE / RECON CRAWL
        // ------------------------------
        const ipZone = payload.geo?.zone || "UNKNOWN_ZONE";

        if (detectPressure(ipZone)) {
            anomalies.push({
                type: ALERT_TYPES.PRESSURE,
                severity: "high",
                message: "Rapid API pressure spike detected — possible botnet or corporate crawl."
            });
        }

        // ------------------------------
        // 3. GEO-PATTERN SCAN DETECTION
        // ------------------------------
        if (detectGeoPattern(token, payload.geo)) {
            anomalies.push({
                type: ALERT_TYPES.PATTERN,
                severity: "high",
                message: "Cross-zone pattern detected — triangulation attempt prevented."
            });
        }

        // ------------------------------
        // 4. SPOOF ATTEMPT (same token, different device)
        // ------------------------------
        const events = SentryState.sessionMap.get(token) || [];
        if (events.length > 0) {
            const lastDevice = events[events.length - 1].deviceSignature;
            const currentDevice = JSON.stringify(payload.device);

            if (lastDevice !== currentDevice) {
                anomalies.push({
                    type: ALERT_TYPES.SPOOF,
                    severity: "critical",
                    message: "Session spoof attempt detected — device mismatch."
                });
            }
        }

        // Save event signature
        events.push({
            ts: Date.now(),
            deviceSignature: JSON.stringify(payload.device)
        });
        if (events.length > 30) events.shift();
        SentryState.sessionMap.set(token, events);

        // ------------------------------
        // 5. EMERGENCY ESCALATION LOGIC
        // ------------------------------
        const critical = anomalies.filter(a => a.severity === "critical" || a.severity === "high");

        if (critical.length > 0) {
            return {
                status: "QUARANTINED",
                token,
                anomalies: critical,
                escalate: emergencyProtocols.escalateToTrust
            };
        }

        // ------------------------------
        // SAFE
        // ------------------------------
        return {
            status: "CLEAR",
            token,
            anomalies
        };
    }
};
