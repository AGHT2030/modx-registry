
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

// © 2025 AIMAL Global Holdings | MODLINK Governance Freeze Middleware
// Enforces HA safety rules:
// - Blocks governance writes during outages
// - Uses heartbeat + leader election + UGW/MODLINK/XRPL live-state
// - Required for Option 3 Hybrid Architecture (ZK → MODLINK → GOV → XRPL)

const { getHeartbeatStatus } = require("../consensus/state-manager");
const { currentLeader } = require("../consensus/arbiter");

module.exports = function governanceFreeze(req, res, next) {
    try {
        // -----------------------------------------------------------
        // 1️⃣ Heartbeat Check — is each subsystem alive?
        // -----------------------------------------------------------
        const hb = {
            modlink: getHeartbeatStatus("MODLINK"),
            xrpl: getHeartbeatStatus("XRPL"),
            ugw: getHeartbeatStatus("UGW")
        };

        // -----------------------------------------------------------
        // 2️⃣ Leadership Status — is there a governing node?
        // -----------------------------------------------------------
        const leader = currentLeader();

        const freeze =
            !leader?.isLeader ||     // No stable leader
            hb.modlink === false ||   // MODLINK heartbeat dead
            hb.xrpl === false ||      // XRPL bridge heartbeat dead
            hb.ugw === false;         // Universe Gateway heartbeat dead

        if (freeze) {
            console.warn("🧊 Governance Freeze Active → blocking:", req.path);

            return res.status(503).json({
                ok: false,
                freeze: true,
                reason: "HIGH_AVAILABILITY_SAFETY_FREEZE",
                details: {
                    leader: leader?.node || null,
                    heartbeats: hb,
                    path: req.path
                }
            });
        }

        // -----------------------------------------------------------
        // 3️⃣ All systems healthy → continue
        // -----------------------------------------------------------
        return next();

    } catch (err) {
        console.error("❌ Governance Freeze Middleware ERROR:", err);

        return res.status(500).json({
            ok: false,
            freeze: true,
            error: "GOVERNANCE_FREEZE_INTERNAL_ERROR"
        });
    }
};
