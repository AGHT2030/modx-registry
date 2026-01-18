
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

// © 2025 AIMAL Global Holdings | MODLINK Registry (Unified DAO + AURA Layer)

// Core module imports
const modh = require("../routes/modh/modh");
const modplay = require("../routes/modplay");
const mode = require("../routes/mode");
const moda = require("../routes/moda");
const modstay = require("../routes/modstay");
const creatv = require("../routes/creatv");
const airs = require("../routes/airs");
const aura = require("../routes/auraVoice");
const mrgt = require("../routes/mrgt");

// ⚠️ IMPORTANT: The following line should be in server.js, not here:
// const modlinkRouter = require("./modlink/modlink");
// app.use("/api/modlink", modlinkRouter);

// 🧠 MODLINK Registry: Defines DAO ownership, governance, and compliance policies
const registry = {
    MODH: {
        route: modh,
        dao: "HealthDAO",
        policy: ["HIPAA", "UserConsent", "SoulBond", "DreamAnalytics"],
        auraLinked: true,
    },
    MODPLAY: {
        route: modplay,
        dao: "EntertainmentDAO",
        policy: ["AgeCheck", "NFTCompliance"],
        auraLinked: true,
    },
    MODE: {
        route: mode,
        dao: "EventsDAO",
        policy: ["PartnerAgreement", "ImmersiveAccess"],
        auraLinked: true,
    },
    MODA: {
        route: moda,
        dao: "MuseumDAO",
        policy: ["MemberAccess", "CulturalLicense", "TokenAccess"],
        auraLinked: true,
    },
    MODSTAY: {
        route: modstay,
        dao: "HospitalityDAO",
        policy: ["GuestAccess", "BookingVerification"],
        auraLinked: true,
    },
    CREATV: {
        route: creatv,
        dao: "MediaDAO",
        policy: ["Copyright", "ContentReview"],
        auraLinked: true,
    },
    AIRS: {
        route: airs,
        dao: "AIRSDAO",
        policy: ["GeoLocation", "SafetyCheck", "UserConsent"],
        auraLinked: true,
    },
    AURA: {
        route: aura,
        dao: "AURAIntelligenceDAO",
        policy: ["EthicalAI", "UserConsent", "AuditLog"],
        auraLinked: true,
    },
    MRGT: {
        route: mrgt,
        dao: "GovernanceDAO",
        policy: ["MetricsIntegrity", "InvestorVerification"],
        auraLinked: false,
    },
};

// 🔗 Route retrieval — unified async interface
function getModuleRoute(module) {
    const entry = registry[module.toUpperCase()];
    if (!entry) return null;

    // Wrap native Express route for MODLINK compliance layer
    return async (endpoint, body, user) => {
        if (typeof entry.route.handle === "function") {
            return {
                status: "ok",
                forwarded: true,
                module,
                endpoint,
                dao: entry.dao,
                policies: entry.policy,
                auraLinked: entry.auraLinked,
                user,
                payload: body,
            };
        }
        return { status: "ok", message: `${module} processed ${endpoint}` };
    };
}

module.exports = { getModuleRoute, registry };

