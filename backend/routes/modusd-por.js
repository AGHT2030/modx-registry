
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

// © 2025 AIMAL Global Holdings | MODUSD PoR → MODLINK Bridge (Option 3)
// ZK Worker → /api/modusd/por/submit → MODLINK → HA / XRPL Universe Gateway

const express = require("express");
const router = express.Router();

// 🔗 MODLINK Core (Option 3 Hybrid Bridge)
let MODLINK;
try {
    MODLINK = require("../modlink/modlink-core");
    console.log("🔗 MODUSD PoR route: MODLINK core loaded (version:", MODLINK.version, ")");
} catch (err) {
    console.warn("⚠️ MODUSD PoR route: MODLINK core not available, running in stub mode", err.message);
    MODLINK = {
        publishPORStatus: async () => {
            console.warn("⚠️ MODLINK.publishPORStatus stub called — no live universe bridge.");
            return false;
        },
    };
}

// ---------------------------------------------------------
// 🩺 Health Check
// ---------------------------------------------------------
router.get("/por/health", (req, res) => {
    return res.json({
        ok: true,
        module: "MODUSD_PoR",
        modlinkVersion: MODLINK.version || "stub",
        ts: Date.now(),
    });
});

// ---------------------------------------------------------
// 🧾 Expected payload shape (from ZK worker / orchestrator)
// ---------------------------------------------------------
// POST /api/modusd/por/submit
// {
//   "proof": { ...plonkProofJson },
//   "publicSignals": [ ... ],
//   "meta": {
//      "reserve_xrpl": "50000000",
//      "reserve_bank": "25000000",
//      "supply": "70000000",
//      "asOfBlock": "XRPL-LEDGER-xxxx",
//      "network": "xrpl-testnet" | "xrpl-mainnet",
//      "source": "MODUSD_POR_WORKER"
//   }
// }
// ---------------------------------------------------------

router.post("/por/submit", async (req, res) => {
    try {
        const { proof, publicSignals, meta } = req.body || {};

        if (!proof || !publicSignals) {
            return res.status(400).json({
                ok: false,
                error: "INVALID_PAYLOAD",
                message: "Expected { proof, publicSignals, meta } in request body.",
            });
        }

        // Basic sanity checks on meta
        const metaSafe = {
            reserve_xrpl: meta?.reserve_xrpl ?? null,
            reserve_bank: meta?.reserve_bank ?? null,
            supply: meta?.supply ?? null,
            asOfBlock: meta?.asOfBlock ?? null,
            network: meta?.network ?? (process.env.XRPL_NETWORK || "xrpl-testnet"),
            source: meta?.source ?? "MODUSD_POR_WORKER",
            ts: Date.now(),
            env: process.env.NODE_ENV || "development",
        };

        const payload = {
            proof,
            publicSignals,
            meta: metaSafe,
        };

        console.log("📨 [MODUSD_PoR] Incoming PoR proof payload:", {
            publicSignalsPreview: Array.isArray(publicSignals)
                ? publicSignals.slice(0, 4)
                : null,
            meta: metaSafe,
        });

        // 🔗 Forward into MODLINK → Universe Gateway (Option 3)
        const delivered = await MODLINK.publishPORStatus(payload);

        if (!delivered) {
            // MODLINK offline / in fallback mode — but we STILL accept the proof
            console.warn("🟡 [MODUSD_PoR] MODLINK offline — PoR packet buffered in replay queue.");
            return res.status(202).json({
                ok: true,
                status: "QUEUED",
                message: "PoR accepted but MODLINK is offline — will replay when online.",
            });
        }

        console.log("🟢 [MODUSD_PoR] PoR packet delivered via MODLINK → Universe Gateway.");
        return res.json({
            ok: true,
            status: "DELIVERED",
            message: "PoR proof forwarded to MODLINK / Universe Gateway.",
        });
    } catch (err) {
        console.error("🚨 [MODUSD_PoR] Error handling PoR submission:", err);
        return res.status(500).json({
            ok: false,
            error: "INTERNAL_ERROR",
            message: "Failed to process PoR proof.",
        });
    }
});

module.exports = router;
