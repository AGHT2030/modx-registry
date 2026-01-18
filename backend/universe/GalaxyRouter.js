/**
 * © 2025–2026 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 */

"use strict";

// --------------------------------------------------------
// Core Maps + Wormholes
// --------------------------------------------------------
const GalaxyMap = require("./Galaxy_Map.js");
const GalaxyWormholes = require("./Galaxy_WormholeRegistry.js");

// --------------------------------------------------------
// TRUST + ORACLE + TELEMETRY (NON-NEGOTIABLE)
// --------------------------------------------------------
const TRUST_Nexus = require("../trust/trust_Nexus.js");
const { TwinOracle } = require("../../core/twins/TwinOracle.js");
const { broadcastTelemetry } = require("./UniverseTelemetry.js");

// --------------------------------------------------------
// GALAXY REGISTRY (STRUCTURAL — REQUIRED)
// --------------------------------------------------------
const ALL_GALAXIES = [
    "STAY", "PLAY", "RETAIL", "SHOP", "MODE", "MOVE", "CREATE", "HEALTH",
    "COMMUNITY", "WORK", "ENERGY", "GIVE", "INVEST", "FARM", "PLAN"
];

// --------------------------------------------------------
// OPTIONAL GOVERNANCE / MODLINK STACK (SAFE LOAD)
// --------------------------------------------------------
let UniverseGateway = null;
let GovernanceListener = null;
let Sentinel = null;
let C5ThreatEngine = null;
let PolicyAdvisor = null;
let io = null;

try {
    UniverseGateway = require("../governance/gateway/UniverseGateway.js");
    GovernanceListener = require("../governance/PulseNFT_Listener.cjs");
    Sentinel = require("../security/Sentinel_Evaluator.cjs");
    C5ThreatEngine = require("../security/C5_ThreatEngine.cjs");
    PolicyAdvisor = require("../governance/PolicyAdvisor.cjs");
    io = require("../../aura/aura-spectrum.js")?.io || null;

    console.log("🧠 Governance stack loaded (Tier-5)");
} catch (err) {
    console.warn("⚠️ Governance stack unavailable — Tier-2 sovereign mode");
}

// --------------------------------------------------------
// 🌌 SAFE UNIVERSE REGISTRATION (SIDE-EFFECT SAFE)
// --------------------------------------------------------
(async function registerUniverse() {
    if (!UniverseGateway?.registerGalaxy) return;

    try {
        for (const g of ALL_GALAXIES) {
            await UniverseGateway.registerGalaxy(g);
        }
        console.log("🌌 MODX Universe registry initialized");
    } catch (err) {
        console.warn("⚠️ Universe registration issue:", err.message);
    }
})();

// --------------------------------------------------------
// 🛡 GOVERNANCE EVENT BRIDGE (GUARDED, IDEMPOTENT)
// --------------------------------------------------------
(function initGovernanceBridge() {
    if (!GovernanceListener || !PolicyAdvisor || !Sentinel || !C5ThreatEngine) {
        return;
    }

    // Governance event intake
    GovernanceListener.on("governance:event", (evt) => {
        try {
            const sentinel = Sentinel.evaluate(evt);
            const threat = C5ThreatEngine.process(evt, sentinel);

            PolicyAdvisor.ingest(evt, sentinel, threat);

            broadcastTelemetry({
                type: "GOVERNANCE_EVENT",
                event: evt,
                sentinel,
                threat,
                timestamp: Date.now()
            });
        } catch (err) {
            console.warn("⚠️ Governance event handling failed:", err.message);
        }
    });

    // Advisory → frontend bridge
    if (io && typeof PolicyAdvisor.on === "function") {
        PolicyAdvisor.on("advisory:update", (advisory) => {
            try {
                io.emit("policy:advisory:update", advisory);
                broadcastTelemetry({
                    type: "POLICY_ADVISORY",
                    advisory,
                    timestamp: Date.now()
                });
            } catch (err) {
                console.warn("⚠️ Advisory broadcast failed:", err.message);
            }
        });
    }

    console.log("🔗 Governance Bridge active (Sentinel + C5 + PolicyAdvisor)");
})();

// --------------------------------------------------------
// ETF REGISTRY (INJECTED — SOVEREIGN)
// --------------------------------------------------------
let ETFRegistry = null;

function setETFRegistry(registry) {
    ETFRegistry = registry;
    console.log("🧬 GalaxyRouter: ETF registry injected");
}

// --------------------------------------------------------
// PULSE ADAPTER TABLE
// --------------------------------------------------------
const AdapterTable = {
    STAY: require("../orbits/STAY_PulseAdapter.js"),
    PLAY: require("../orbits/PLAY_PulseAdapter.js"),
    RETAIL: require("../orbits/SHOP_PulseAdapter.js"),
    SHOP: require("../orbits/SHOP_PulseAdapter.js"),
    MODE: require("../orbits/MODE_PulseAdapter.js"),
    MOVE: require("../orbits/MOVE_PulseAdapter.js"),
    CREATE: require("../orbits/CREATE_PulseAdapter.js"),
    HEALTH: require("../orbits/HEALTH_PulseAdapter.js"),
    COMMUNITY: require("../orbits/COMMUNITY_PulseAdapter.js"),
    WORK: require("../orbits/WORK_PulseAdapter.js"),
    ENERGY: require("../orbits/ENERGY_PulseAdapter.js"),
    GIVE: require("../orbits/GIVE_PulseAdapter.js"),
    INVEST: require("../orbits/INVEST_PulseAdapter.js"),
    FARM: null
};

// --------------------------------------------------------
// 🧠 MAIN GALAXY ROUTER (SOVEREIGN CORE)
// --------------------------------------------------------
async function routeGalaxyEvent(event = {}) {
    const { emotion, originGalaxy, payload = {} } = event;

    // 1️⃣ Emotion → Galaxy
    const galaxyObj =
        GalaxyMap.map[emotion] || GalaxyMap.map["curiosity"];
    let galaxyName = galaxyObj.name;

    // 2️⃣ Wormhole
    const next =
        GalaxyWormholes.list()[`${originGalaxy}→${galaxyName}`] || null;

    // 3️⃣ ORACLE (SOVEREIGN POSITION — PRESERVED)
    const oracle = TwinOracle.advise({
        ...event,
        galaxy: galaxyName,
        next
    });

    // ----------------------------------------------------
    // PLAN ↔ MODE HYBRID (PRESERVED)
    // ----------------------------------------------------
    if (galaxyName === "PLAN" || galaxyName === "MODE") {
        event.hybridRouting = TwinOracle.advise({
            ...event,
            galaxy: galaxyName,
            hybrid: true,
            reasoning: "PLAN↔MODE hybrid"
        });
    }

    // ----------------------------------------------------
    // FARM AID (PRESERVED)
    // ----------------------------------------------------
    if (galaxyName === "FARM") {
        const FarmAidNexus =
            require("../orbits/farm/farmAid/farmAid_Nexus.js");

        const farmResult = await FarmAidNexus.route(payload);

        return {
            oracle,
            galaxy: "FARM",
            next: farmResult.nextGalaxy,
            validated: { via: "FARM_AID" },
            pulseActivation: farmResult
        };
    }

    // ----------------------------------------------------
    // TRUST VALIDATION (NON-NEGOTIABLE)
    // ----------------------------------------------------
    const validated = TRUST_Nexus.validateEvent({
        ...event,
        oracle,
        galaxy: galaxyName,
        next
    });

    // ----------------------------------------------------
    // ETF ROUTING (SAFE, OPTIONAL)
    // ----------------------------------------------------
    if (payload.etf && ETFRegistry?.[payload.etf]) {
        return {
            oracle,
            galaxy: galaxyName,
            next,
            validated,
            etf: ETFRegistry[payload.etf]
        };
    }

    // ----------------------------------------------------
    // PULSE ADAPTER
    // ----------------------------------------------------
    const Adapter = AdapterTable[galaxyName];
    const pulseActivation = Adapter
        ? await Adapter.run({ ...event, galaxy: galaxyName, oracle, validated })
        : { brand: "TRUST_CORE", message: "Governance-only orbit" };

    // ----------------------------------------------------
    // TELEMETRY
    // ----------------------------------------------------
    broadcastTelemetry({
        type: "GALAXY_EVENT",
        originGalaxy,
        galaxy: galaxyName,
        pulse: pulseActivation,
        oracle,
        timestamp: Date.now()
    });

    // ----------------------------------------------------
    // FINAL RETURN (SOVEREIGN OUTPUT)
    // ----------------------------------------------------
    return {
        oracle,
        galaxy: galaxyName,
        next,
        validated,
        pulseActivation
    };
}

// --------------------------------------------------------
// EXPORT (STABLE API)
// --------------------------------------------------------
module.exports = {
    routeGalaxyEvent,
    setETFRegistry
};
