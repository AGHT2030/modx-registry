
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
 * © 2025 Mia Lopez | AG Holdings Trust
 * Administrative Control API (Tier-0 Root Authority)
 *
 * Protects:
 *  - XRPL Issuer Controls
 *  - EVM Governance Controls
 *  - MODX Governance Controls
 *  - Liquidity Sync
 *  - Proof-of-Reserves Sync
 *
 * Role Requirements:
 *  - AGH_TRUSTEE (root)
 *  - COINPURSE_SYSADMIN (ops)
 *  - BLC_ADMIN (HQ)
 */

const express = require("express");
const router = express.Router();
const PQC = global.PQC;

const Controls = require("./adminControlEngine.cjs");

// Optional AURA logging
const advisor = require("./twinsPolicyAdvisor.cjs");

/* ---------------------------------------------------------
   👮 ROLE AUTH MIDDLEWARE
--------------------------------------------------------- */
function requireAdmin(req, res, next) {
    try {
        const role = req.headers["x-admin-role"];

        if (!role)
            return res.status(401).json({ error: "Missing admin role." });

        const allowed = ["AGH_TRUSTEE", "COINPURSE_SYSADMIN", "BLC_ADMIN"];

        if (!allowed.includes(role))
            return res.status(403).json({ error: "Unauthorized role." });

        req.role = role;
        next();
    } catch (err) {
        return res.status(500).json({ error: "Internal auth error." });
    }
}

/* ---------------------------------------------------------
   🧠 LOG + PQC SIGN
--------------------------------------------------------- */
async function logAction(action, actor) {
    const advisory = await advisor.generateAdvisory({
        action,
        actor,
        timestamp: new Date().toISOString()
    });

    if (global.io) {
        global.io.emit("admin:action", { action, actor, advisory });
    }

    return advisory;
}

/* ---------------------------------------------------------
   📘 STATUS
--------------------------------------------------------- */
router.get("/admin/controls/status", requireAdmin, (req, res) => {
    res.json({
        ok: true,
        state: Controls.state
    });
});

/* ---------------------------------------------------------
   1️⃣ XRPL FREEZE
--------------------------------------------------------- */
router.post("/admin/freeze/xrpl", requireAdmin, async (req, res) => {
    const state = Controls.freezeXRPL(req.role);
    await logAction("freeze_xrpl", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

router.post("/admin/unfreeze/xrpl", requireAdmin, async (req, res) => {
    const state = Controls.unfreezeXRPL(req.role);
    await logAction("unfreeze_xrpl", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

/* ---------------------------------------------------------
   2️⃣ EVM GOVERNANCE PAUSE
--------------------------------------------------------- */
router.post("/admin/pause/evm-governance", requireAdmin, async (req, res) => {
    const state = Controls.pauseEVMGovernance(req.role);
    await logAction("pause_evm_governance", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

router.post("/admin/resume/evm-governance", requireAdmin, async (req, res) => {
    const state = Controls.resumeEVMGovernance(req.role);
    await logAction("resume_evm_governance", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

/* ---------------------------------------------------------
   3️⃣ MODX GOVERNANCE LOCK
--------------------------------------------------------- */
router.post("/admin/lock/modx-gov", requireAdmin, async (req, res) => {
    const state = Controls.lockMODXGovernance(req.role);
    await logAction("lock_modx_governance", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

router.post("/admin/unlock/modx-gov", requireAdmin, async (req, res) => {
    const state = Controls.unlockMODXGovernance(req.role);
    await logAction("unlock_modx_governance", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

/* ---------------------------------------------------------
   4️⃣ LIQUIDITY SYNC
--------------------------------------------------------- */
router.post("/admin/pause/liquidity", requireAdmin, async (req, res) => {
    const state = Controls.pauseLiquiditySync(req.role);
    await logAction("pause_liquidity_sync", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

router.post("/admin/resume/liquidity", requireAdmin, async (req, res) => {
    const state = Controls.resumeLiquiditySync(req.role);
    await logAction("resume_liquidity_sync", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

/* ---------------------------------------------------------
   5️⃣ Proof-of-Reserves Sync
--------------------------------------------------------- */
router.post("/admin/pause/por", requireAdmin, async (req, res) => {
    const state = Controls.pausePoR(req.role);
    await logAction("pause_por", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

router.post("/admin/resume/por", requireAdmin, async (req, res) => {
    const state = Controls.resumePoR(req.role);
    await logAction("resume_por", req.role);
    Controls.broadcast();
    res.json({ ok: true, state });
});

/* ---------------------------------------------------------
   EXPORT
--------------------------------------------------------- */
module.exports = router;
