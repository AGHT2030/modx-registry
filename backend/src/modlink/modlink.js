
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

// © 2025 AIMAL Global Holdings | MODLINK Main Router
const express = require("express");
const router = express.Router();
const { checkPolicy } = require("./modlinkPolicy");
const { getModuleRoute } = require("./modlinkRegistry");
const { recordAudit } = require("./modlinkAudit");

router.all("/:module/:endpoint", async (req, res) => {
    const { module, endpoint } = req.params;
    const user = req.user || { id: "guest" };
    const policyToken = req.headers["x-policy-token"];

    try {
        // ✅ Step 1: Policy verification
        const allowed = await checkPolicy(module, user, policyToken);
        if (!allowed)
            return res.status(403).json({ error: `Access denied by MODLINK policy for ${module}` });

        // ✅ Step 2: Route lookup
        const routeHandler = getModuleRoute(module);
        if (!routeHandler)
            return res.status(404).json({ error: `Module ${module} not registered with MODLINK` });

        // ✅ Step 3: Forward request
        const result = await routeHandler(endpoint, req.body, user);

        // ✅ Step 4: Audit trail
        await recordAudit({
            module,
            endpoint,
            userId: user.id,
            ip: req.ip,
            timestamp: new Date(),
            status: "success",
        });

        res.json(result);
    } catch (err) {
        console.error(`❌ MODLINK Router Error [${module}/${endpoint}]`, err);
        await recordAudit({
            module,
            endpoint,
            userId: user.id,
            ip: req.ip,
            timestamp: new Date(),
            status: "failed",
            error: err.message,
        });
        res.status(500).json({ error: "Internal MODLINK router failure" });
    }
});

module.exports = router;
