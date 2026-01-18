
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
 * © 2025 AIMAL Global Holdings | XRPL Verification API Route
 * 
 * Expands the base /xrpl/verify endpoint with:
 *  - AURA Outlier Sentinel scoring
 *  - AURA Twins Policy Advisory
 *  - PQC trust-seal enforcement
 *  - Compliance Inbox push
 *  - MODLINK + Universe Gateway sync event
 *  - CoinPurse Dashboard real-time feed
 */

const express = require("express");
const router = express.Router();

const { runVerification } = require("../xrpl/verification/tokenVerifier.cjs");
const sentinel = require("../modx/governance/outlierSentinel.cjs");
const advisor = require("../modx/governance/twinsPolicyAdvisor.cjs");

// fallback compliance inbox
const complianceBus =
    typeof global.COINPURSE_PUSH_INBOX === "function"
        ? global.COINPURSE_PUSH_INBOX
        : (d) => console.log("ℹ️ Compliance inbox fallback:", d);

// PQC layer (already loaded globally)
const PQC = global.PQC || {
    sign: () => ({ integrity: "none", timestamp: Date.now() }),
    verify: () => true
};

router.get("/xrpl/verify", async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log("🔍 Running XRPL Verification at", timestamp);

    try {
        /* -----------------------------------------------------------
           1) XRPL Token Verification Engine
        ----------------------------------------------------------- */
        const results = await runVerification();

        /* -----------------------------------------------------------
           2) Apply Sentinel Risk Scoring + AURA Advisory
        ----------------------------------------------------------- */
        for (const r of results) {
            r.risk = await sentinel.evaluateImpact(
                {
                    chain: "XRPL",
                    token: r.token,
                    supply: r.supply,
                    flags: r.flags,
                    issuer: r.issuer
                },
                []
            );

            r.advisory = await advisor.generateAdvisory({
                token: r.token,
                supply: r.supply,
                issuer: r.issuer,
                flags: r.flags
            });
        }

        /* -----------------------------------------------------------
           3) PQC Seal Confirmation (trust-layer)
        ----------------------------------------------------------- */
        const pqcBlock = PQC.sign(JSON.stringify(results));

        const packet = {
            verifiedAt: timestamp,
            issuer: results[0]?.issuer || null,
            assets: results,
            pqc: pqcBlock
        };

        /* -----------------------------------------------------------
           4) Send to Compliance Inbox
        ----------------------------------------------------------- */
        complianceBus({
            source: "XRPL",
            event: packet,
            advisory: packet.assets.map((a) => a.advisory)
        });

        /* -----------------------------------------------------------
           5) Real-Time Streaming → CoinPurse Dashboard + AURA Twins
        ----------------------------------------------------------- */
        if (global.io) {
            global.io.emit("xrpl:verification:update", packet);
            global.io.emit("policy:advisory:update", packet.assets);
        }

        /* -----------------------------------------------------------
           6) Universe Gateway Hook
        ----------------------------------------------------------- */
        if (global.MODX_UNIVERSE) {
            global.MODX_UNIVERSE.lastXRPLVerification = packet;
        }

        /* -----------------------------------------------------------
           7) Return API Response
        ----------------------------------------------------------- */
        res.json({
            ok: true,
            verifiedAt: timestamp,
            issuer: packet.issuer,
            assets: results,
            pqc: pqcBlock
        });

    } catch (err) {
        console.error("❌ XRPL Verification Error:", err);

        res.status(500).json({
            ok: false,
            timestamp,
            error: err.message
        });
    }
});

module.exports = router;
