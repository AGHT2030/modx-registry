
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

// © 2025 AIMAL Global Holdings | MODLINK HA Leader Broadcast
// Emits High-Availability leader status to all connected clients.
// This powers governance freeze warnings, UGW online/offline,
// XRPL + MODLINK dual-heartbeat, and dashboard HA indicator lights.

const { determineLeader } = require("../consensus/arbiter");
const { getHeartbeatStatus } = require("../consensus/state-manager");

module.exports = function setupLeaderBroadcast(io) {
    console.log("📡 Leader Broadcast Service initialized");

    setInterval(async () => {
        try {
            // ---------------------------------------------------------
            // 🧠 1. Determine current cluster leader
            // ---------------------------------------------------------
            const leader = await determineLeader();

            // ---------------------------------------------------------
            // 💓 2. Gather heartbeat status for subsystems
            //    (MODLINK, XRPL Gateway, AURA, Universe Gateway)
            // ---------------------------------------------------------
            const heartbeats = {
                modlink: getHeartbeatStatus("MODLINK"),
                xrpl: getHeartbeatStatus("XRPL"),
                aura: getHeartbeatStatus("AURA"),
                ugw: getHeartbeatStatus("UGW"),
            };

            // ---------------------------------------------------------
            // 🧊 3. Governance Freeze Logic
            //    Freeze occurs if:
            //    - No leader, OR
            //    - Heartbeat failure from MODLINK or XRPL, OR
            //    - UGW offline
            // ---------------------------------------------------------
            const freeze =
                !leader?.isLeader ||
                !heartbeats.modlink ||
                !heartbeats.xrpl ||
                !heartbeats.ugw;

            const status = {
                leader: {
                    node: leader.node,
                    isLeader: leader.isLeader,
                    timestamp: Date.now(),
                },
                heartbeats,
                freezeActive: freeze,
            };

            // ---------------------------------------------------------
            // 🚀 4. Emit the unified status update
            // ---------------------------------------------------------
            io.emit("ha:leader:update", status);

            console.log("🔄 [Leader-Broadcast] Sent HA status →", {
                leader: leader.node,
                freeze,
            });

        } catch (err) {
            console.error("❌ Leader Broadcast Error:", err);
        }
    }, 5000);
};
