/**
 * © 2025 AG Holdings Trust | Sovereign Defense Systems
 * AGH Strategic Defense Console API
 */

const express = require("express");
const router = express.Router();

const requireTrustee = require("../middleware/requireTrustee");
const requireBioDigitalKey = require("../middleware/requireBioDigitalKey");

const { NSDG } = require("../defense/NSDG_Core.cjs");
const { AGA } = require("../defense/AURA_GovernanceAgent.cjs");
const { ArbitrageGuardian } = require("../defense/ETF_ArbitrageGuardian.cjs");
const C5 = require("../sentinel/C5_Engine.cjs");
const AURA = require("../aura/AuraPresenceService.cjs");
const TIF = require("../aura/tif/TIF_Model.cjs");
const ZeroTrace = require("../classified/ZeroTrace.cjs");
const RedTeam = require("../defense/RedTeamSimulator.cjs");


// 🔐 All Defense Console routes require:
// • Trustee role
// • Bio-key authentication
router.use(requireTrustee, requireBioDigitalKey);


/* -------------------------------------------------------------
   1️⃣  NSDG — National Security Defense Graph Snapshot
------------------------------------------------------------- */
router.get("/nsdg/snapshot", (req, res) => {
    res.json({
        events: global.NSDG_EVENTS || [],
        status: "OK"
    });
});


/* -------------------------------------------------------------
   2️⃣  AURA Governance Agent State
------------------------------------------------------------- */
router.get("/aga/state", (req, res) => {
    const state = {
        drift: AURA.lastDrift,
        fpMatch: AURA.lastFingerprint,
        c5Threat: C5.getLevel(),
        navShock: global.ETF_NAV_SHOCK || false
    };

    res.json({
        state,
        evaluation: AGA.evaluate(state)
    });
});


/* -------------------------------------------------------------
   3️⃣  C5 Threat Engine Overview
------------------------------------------------------------- */
router.get("/c5/overview", (req, res) => {
    res.json({
        heatmap: C5.getHeatmap(),
        recent: C5.getRecent(),
        score: C5.getLevel()
    });
});


/* -------------------------------------------------------------
   4️⃣  Arbitrage Guardian Status
------------------------------------------------------------- */
router.get("/arbitrage/status", (req, res) => {
    res.json({
        frozen: global.ETF_FROZEN || false,
        lastShock: global.ETF_LAST_ARBITRAGE || null
    });
});


/* -------------------------------------------------------------
   5️⃣  Zero-Trace Session Status
------------------------------------------------------------- */
router.get("/zerotrace/state", (req, res) => {
    const token = req.headers["x-classified-token"];

    res.json({
        valid: ZeroTrace.validateSession(token),
        activeSessions: ZeroTrace.memorySessions.size
    });
});


/* -------------------------------------------------------------
   6️⃣  Run Red Team Scenario
------------------------------------------------------------- */
router.post("/redteam/run", (req, res) => {
    const { scenario } = req.body;
    const result = RedTeam.runScenario(scenario, req.user.email);

    res.json({
        scenario,
        result
    });
});


module.exports = router;
