
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
 * © 2025 Mia Lopez | Vault Throttle Engine (Black Hole B)
 *
 * PURPOSE:
 *  - Auto-rate-limits suspicious activity
 *  - Creates isolation bubbles for high-risk behavior
 *  - Activates PQC lockdown for critical events
 *  - Feeds Security Genome mutations
 */

const { ingestGenomeEvent } = require("../genome/SecurityGenomeRouter");

// In-memory throttle map
let THROTTLE_MAP = new Map();

// BASE CONFIG
const BASE_LIMITS = {
    normal: 30,        // 30 requests/min
    elevated: 10,      // suspicious → 10 req/min
    hostile: 3,        // attack → 3 req/min
    critical: 1        // likely compromise → 1 req/min
};

// PQC LOCKDOWN FLAG
let PQC_LOCKDOWN = false;

/* ------------------------------------------------------
   INTERNAL HELPERS
------------------------------------------------------ */
function now() {
    return Date.now();
}

function throttleKey(user, device) {
    return `${user || "guest"}_${device || "nodef"}`;
}

/* ------------------------------------------------------
   PUBLIC: Evaluate request attempt
------------------------------------------------------ */
function evaluateThrottle({ user, device, vector, severity }) {
    const key = throttleKey(user, device);
    const entry = THROTTLE_MAP.get(key) || {
        count: 0,
        windowStart: now(),
        level: "normal",
        locked: false
    };

    const elapsed = now() - entry.windowStart;

    // Reset window every minute
    if (elapsed > 60_000) {
        entry.count = 0;
        entry.windowStart = now();
    }

    entry.count++;

    /* ------------------------------------------------------
       DETERMINE LEVEL OF THROTTLING
    ------------------------------------------------------ */
    if (severity === "LOW") entry.level = "normal";
    if (severity === "MEDIUM") entry.level = "elevated";
    if (severity === "HIGH") entry.level = "hostile";
    if (severity === "CRITICAL") {
        entry.level = "critical";
        entry.locked = true;
        activatePqcLockdown(user, device, vector);
    }

    const limit = BASE_LIMITS[entry.level];

    THROTTLE_MAP.set(key, entry);

    // Evaluate if throttled
    const allowed = entry.count <= limit;

    // If exceeded → produce genome mutation
    if (!allowed) {
        ingestGenomeEvent({
            type: "behavior",
            source: user || "unknown",
            severity: severity || "MEDIUM",
            vector,
            metadata: { device }
        });
    }

    return {
        allowed,
        level: entry.level,
        locked: entry.locked,
        pqcLockdown: PQC_LOCKDOWN,
        remaining: Math.max(0, limit - entry.count)
    };
}

/* ------------------------------------------------------
   PQC LOCKDOWN — CRITICAL ONLY
------------------------------------------------------ */
function activatePqcLockdown(user, device, vector) {
    PQC_LOCKDOWN = true;

    ingestGenomeEvent({
        type: "threat",
        source: user || "unknown",
        severity: "CRITICAL",
        vector: vector || "unknown",
        metadata: { device, lockdown: true }
    });

    console.log("🚨 PQC LOCKDOWN ACTIVATED — CRITICAL BEHAVIOR DETECTED");
}

/* ------------------------------------------------------
   CLEAR ALL THROTTLE (ADMIN ONLY)
------------------------------------------------------ */
function resetThrottle() {
    THROTTLE_MAP.clear();
    PQC_LOCKDOWN = false;
    console.log("🧹 Vault throttle reset.");
}

/* ------------------------------------------------------
   EXPORT
------------------------------------------------------ */
module.exports = {
    evaluateThrottle,
    resetThrottle,
};
