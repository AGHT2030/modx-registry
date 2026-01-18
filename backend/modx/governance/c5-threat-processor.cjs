
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

// © 2025 Mia Lopez | AIMAL Global Holdings
// C5 Threat Processor — XRPL/EVM → C5 Engine Bridge
// Makes listeners lightweight and keeps C5 engine centralized.

const { processC5 } = require("./c5-threat-engine.js");
const chalk = require("chalk");

/**
 * Main processor wrapper — used by:
 *   • xrpl-governance-listener.js
 *   • evm-governance-listener.js
 *   • hybrid-governance-bridge.js
 *   • modlink galaxy events
 */
async function handleGovernanceEvent(evt) {
    try {
        console.log(chalk.blue(`🔗 [C5] Processing governance event (${evt.chain})...`));
        const sealed = await processC5(evt);

        console.log(
            chalk.green(
                `🛡️ [C5] Event sealed → Threat ${sealed.classification.id}, Heat ${sealed.heat}`
            )
        );

        return sealed;
    } catch (err) {
        console.error("❌ C5 Threat Processor Error:", err.message, err);
        return { error: err.message };
    }
}

module.exports = {
    handleGovernanceEvent
};
