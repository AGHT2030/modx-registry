/**
 * Sovereign Command AI (Phase III)
 * © 2025 AGH Sovereign Technologies
 */

const C5 = require("../sentinel/C5_Engine.cjs");
const AURA = require("../aura/AuraPresenceService.cjs");
const TIF = require("../aura/tif/TIF_Model.cjs");
const PQC = require("../security/pqc/PQC_IntegrityEngine.cjs");
const ArbitrageGuardian = require("../defense/ArbitrageGuardian.cjs");
const ETFBreaker = require("../etf/ETF_CircuitBreaker.cjs");

module.exports = {
    /**
     * Evaluate all defense intelligence sources and issue a URD.
     */
    evaluate(intel) {
        const drift = AURA.classifyDrift(intel.headers);
        const fp = TIF.verifyFingerprint(intel.user, intel.headers);
        const pqc = PQC.verify();
        const c5 = C5.evaluate(intel);

        const breaker = ETFBreaker.globalHalted ? "HALT" : "OK";
        const arb = ArbitrageGuardian.isFrozen() ? "FROZEN" : "OK";

        const payload = {
            drift,
            fp,
            pqc: pqc.verified,
            c5,
            breaker,
            arb
        };

        // CRITICAL THREAT
        if (c5 === "CRITICAL" || drift === "ANOMALY" || !pqc.verified) {
            return {
                level: "CRITICAL",
                directive: "ROLLBACK_AND_LOCKDOWN",
                payload
            };
        }

        // HIGH THREAT
        if (c5 === "HIGH" || breaker === "HALT") {
            return {
                level: "HIGH",
                directive: "RESTRICT_OPERATIONS",
                payload
            };
        }

        // NORMAL
        return {
            level: "NORMAL",
            directive: "ALLOW",
            payload
        };
    }
};
