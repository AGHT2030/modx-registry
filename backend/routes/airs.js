
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
// 🌐 Connects AIRS core to MODE, CREATV, MODA Stay, and Civic Safety hybrid modules.

const express = require("express");
const router = express.Router();
const { logAIRSChange } = require("../utils/airsChangeLogger");
const { safeRequire } = require("../middleware/globalMiddlewareLoader");

// Log load
logAIRSChange(__filename, "load", "AIRS Router loaded");

// ---------------------------------------------------------------------------
// 🔹 Safe hybrid imports (wrapped to prevent undefined middleware crashes)
// ---------------------------------------------------------------------------
const civicSafety = safeRequire("../middleware/civicSafety") || {};
const modeHybrid = safeRequire("./api/modeHybrid") || {};
const creatvHybrid = safeRequire("./api/creatvHybrid") || {};
const modaStay = safeRequire("./api/modaStay") || {};

// Extract routers if available
const civicSafetyRouter = civicSafety.router || express.Router();
const modeRouter = modeHybrid.router || express.Router();
const creatvRouter = creatvHybrid.router || express.Router();
const modaRouter = modaStay.router || express.Router();

// ---------------------------------------------------------------------------
// ✅ Health Endpoint
// ---------------------------------------------------------------------------
router.get("/health", (req, res) => {
    res.json({
        status: "online",
        module: "AIRS Core Router",
        integrations: ["MODE", "CREATV", "MODA Stay", "Civic Safety"],
        timestamp: new Date().toISOString(),
    });
});

// ---------------------------------------------------------------------------
// 🧩 Safely Mount All Sub-Routers
// ---------------------------------------------------------------------------
try {
    router.use("/mode", modeRouter);
    router.use("/creatv", creatvRouter);
    router.use("/modaStay", modaRouter);
    router.use("/civicSafety", civicSafetyRouter);
} catch (err) {
    console.error("❌ AIRS router mounting error:", err.message);
}

// ---------------------------------------------------------------------------
// ✅ Export router
// ---------------------------------------------------------------------------
module.exports = router;
