
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

// © 2025 Mia Lopez | AIRS Unified Router 
// 🔒 Immutable Core: Combines AI Services, Safety Intelligence, and Hybrid Integrations
// Protected Root Orbit under AIMAL Global Holdings (AGH) / MODX Ecosystem

const express = require("express");
const router = express.Router();
const chalk = require("chalk");

// ---------------------------------------------------------------------------
// 🧠 Core AIRS Modules
// ---------------------------------------------------------------------------
const airServices = require("./airs");
const airSafety = require("./airsafety");

// ---------------------------------------------------------------------------
// 🌐 Hybrid Integrations — Unified under AIRS
// ---------------------------------------------------------------------------
const modeHybrid = require("./api/modeHybrid");
const creatvHybrid = require("./api/creatvHybrid");
const modaStayHybrid = require("./api/modaStayHybrid");
const airsHybrid = require("./api/airsHybrid");
const hybridHealth = require("./api/hybridHealth");

// ---------------------------------------------------------------------------
// 🧩 Middleware & Context Hooks (Safe-Loaded + Auto-Synced)
// ---------------------------------------------------------------------------
const { safeRequire, sharedProvider } = require("../middleware/globalMiddlewareLoader");

// Ensure provider sync is logged once at boot
if (sharedProvider) {
    console.log("🛰️  AIRS Unified Router connected via shared provider:", sharedProvider.connection?.url);
}

// --- AIRS ---
const airsMiddleware = safeRequire("../middleware/airsMiddleware");
const verifyAIRSAuth = airsMiddleware?.verifyAIRSAuth || ((req, res, next) => next());
router.use("/airs", asRouter(airsMiddleware));

// --- Civic ---
const civicSafetyHook =
    safeRequire("../middleware/civicSafety")?.civicSafetyHook || ((req, res, next) => next());

// --- MODE ---
const modeSessionHandler = safeRequire("../middleware/modeSessionHandler");
const syncModeSessions = modeSessionHandler?.syncModeSessions || ((req, res, next) => next());
router.use("/mode", syncModeSessions, asRouter(modeHybrid));

// --- CREATV ---
const creatvSessionSync = safeRequire("../middleware/creatvSessionSync");
const creatvHybrid = safeRequire("../routes/api/creatvHybrid");

const syncCreatvSessions =
    creatvSessionSync?.syncCreatvSessions || ((req, res, next) => next());

if (creatvHybrid && typeof syncCreatvSessions === "function") {
    router.use("/creatv", syncCreatvSessions, asRouter(creatvHybrid));
} else {
    console.warn("⚠️ Skipped CREATV route — missing middleware or hybrid router.");
}

// --- MODA Stay ---
router.use("/moda-stay", asRouter(modaStayHybrid));

// --- CoinPurse ---
const coinpurseHybrid = safeRequire("./api/coinpurseHybrid");
router.use("/coinpurse", asRouter(coinpurseHybrid));

// --- Hybrid Health ---
router.use("/api/hybrids", verifyAIRSAuth, asRouter(hybridHealth));

// ---------------------------------------------------------------------------
// 🔒 Unified Route Composition
// ---------------------------------------------------------------------------

// Helper: safely resolve routers or fallback endpoints
function asRouter(mod) {
    try {
        if (!mod) {
            return (req, res) => res.json({ status: "offline", module: "unavailable" });
        }
        if (typeof mod === "function") return mod;
        if (mod.router && typeof mod.router === "function") return mod.router;
        if (mod.default && typeof mod.default === "function") return mod.default;
        return (req, res) =>
            res.json({
                status: "invalid module",
                module: typeof mod,
                note: "Expected function or router",
            });
    } catch (err) {
        console.error("❌ asRouter fallback triggered for module:", err.message);
        return (req, res) => res.json({ status: "error", error: err.message });
    }
}

// Core AIRS Services
router.use("/services", verifyAIRSAuth, asRouter(airServices));

// Safety + Civic Alerts
router.use("/safety", civicSafetyHook, asRouter(airSafety));

// MODE integrations
router.use("/mode", syncModeSessions, asRouter(modeHybrid));

// CreaTV integrations
router.use("/creatv", syncCreatvSessions, asRouter(creatvHybrid));

// MODA Stay integrations
router.use("/moda-stay", asRouter(modaStayHybrid));

// AIRS Hybrid Middleware
router.use("/airs", asRouter(airsHybrid));

// Unified Hybrid Health
router.use("/api/hybrids", verifyAIRSAuth, asRouter(hybridHealth));

// ---------------------------------------------------------------------------
// 🧩 MODLINK DAO REGISTRATION (Education, Finance, etc.)
// ---------------------------------------------------------------------------
try {
    const educationDAO = require("../modlink/dao/educationDAO");
    const entertainmentDAO = require("../modlink/dao/entertainmentDAO");
    const eventsDAO = require("../modlink/dao/eventsDAO");
    const financeDAO = require("../modlink/dao/financeDAO");
    const governanceDAO = require("../modlink/dao/governanceDAO");
    const healthDAO = require("../modlink/dao/healthDAO");
    const hospitalityDAO = require("../modlink/dao/hospitalityDAO");
    const sustainabilityDAO = require("../modlink/dao/sustainabilityDAO");

    router.use("/dao/education", asRouter(educationDAO));
    router.use("/dao/entertainment", asRouter(entertainmentDAO));
    router.use("/dao/events", asRouter(eventsDAO));
    router.use("/dao/finance", asRouter(financeDAO));
    router.use("/dao/governance", asRouter(governanceDAO));
    router.use("/dao/health", asRouter(healthDAO));
    router.use("/dao/hospitality", asRouter(hospitalityDAO));
    router.use("/dao/sustainability", asRouter(sustainabilityDAO));

    [
        "EducationDAO",
        "EntertainmentDAO",
        "EventsDAO",
        "FinanceDAO",
        "GovernanceDAO",
        "HealthDAO",
        "HospitalityDAO",
        "SustainabilityDAO",
    ].forEach((dao) => console.log(chalk.green(`✅ DAO Registered: ${dao}`)));
} catch (err) {
    console.error("⚠️ DAO Registration failed:", err.message);
}

// ---------------------------------------------------------------------------
// 🚦 Catch-All Handler (404)
// ---------------------------------------------------------------------------
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "AIRS or DAO endpoint not found",
        hint:
            "Valid routes: /services /safety /mode /creatv /moda-stay /coinpurse /api/hybrids /dao/*",
    });
});

// ---------------------------------------------------------------------------
// ✅ Export Unified Router
// ---------------------------------------------------------------------------
module.exports = router;
