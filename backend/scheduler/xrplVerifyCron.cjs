
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
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * XRPL Verification Cron — SAFE MODE
 */

const { runVerification } = require("../xrpl/verification/tokenVerifier.cjs");
const sentinel = require("../modx/governance/outlierSentinel.cjs");
const advisor = require("../modx/governance/twinsPolicyAdvisor.cjs");

const PQC = global.PQC || {
    sign: () => ({ integrity: "none", timestamp: Date.now() }),
    verify: () => true
};

const complianceBus =
    typeof global.COINPURSE_PUSH_INBOX === "function"
        ? global.COINPURSE_PUSH_INBOX
        : (d) => console.log("ℹ️ Compliance inbox fallback:", d);

async function runCron() {
    const timestamp = new Date().toISOString();
    console.log(`🕒 [CRON] XRPL Verification triggered @ ${timestamp}`);

    // 🔒 HARD SAFETY GATE (CORRECT)

    if (!global.XRPL_READY || !global.XRPL_CLIENT?.isConnected()) {
        global.XRPL_DEGRADED = true;
        console.warn("⚠️ [CRON] XRPL not ready — skipping safely");
        return;
    }

    if (!process.env.XRPL_ISSUER_ADDRESS) {
        console.warn("⚠️ [CRON] XRPL_ISSUER_ADDRESS missing — skipping");
        return;
    }

    try {
        const results = await runVerification();

        for (const r of results) {
            r.risk = await sentinel.evaluateImpact(
                {
                    chain: "XRPL",
                    token: r.token,
                    issuer: r.issuer,
                    supply: r.supply,
                    flags: r.flags
                },
                []
            );

            r.advisory = await advisor.generateAdvisory({
                token: r.token,
                issuer: r.issuer,
                supply: r.supply,
                flags: r.flags
            });
        }

        const pqcBlock = PQC.sign(JSON.stringify(results));

        const packet = {
            ok: true,
            triggeredBy: "cron",
            verifiedAt: timestamp,
            issuer: results[0]?.issuer || null,
            assets: results,
            pqc: pqcBlock
        };

        complianceBus({
            source: "XRPL",
            event: packet,
            advisory: packet.assets.map((a) => a.advisory)
        });

        if (global.io) {
            global.io.emit("xrpl:verification:update", packet);
            global.io.emit("policy:advisory:update", packet.assets);
        }

        if (global.MODX_UNIVERSE) {
            global.MODX_UNIVERSE.lastXRPLVerification = packet;
        }

        console.log("🛡️ [CRON] XRPL Verification COMPLETE");

    } catch (err) {
        console.error("❌ [CRON] XRPL Verification Error:", err.message);
    }
}

module.exports = { runCron };

