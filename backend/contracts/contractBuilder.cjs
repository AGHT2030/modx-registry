
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

// © 2025 AIMAL Global Holdings | Contract Builder (XRPL-Orchestrator v2.5)
// Purpose: Orchestrates chain-specific deployments WITHOUT duplicating side effects.
// Notes:
//  - All post-deploy actions (Vault artifact, DAO sync, Fidelity notify) are performed
//    INSIDE xrplClient.mintProjectOnXRPL on SUCCESS.
//  - This builder only returns the result or records a single PENDING file on failure.
//  - No DAO or Fidelity calls here to prevent double-logging/duplication.

require("dotenv").config({ path: ".env.override" });

const path = require("path");
const fs = require("fs");

const { logEvent } = require("../hooks/useLogger.cjs");
const { mintProjectOnXRPL } = require("./xrplClient.cjs");

// Root vault path used for pending markers on failure
const VAULT_CONTRACTS_DIR = path.resolve("AGVault/investment/contracts");
if (!fs.existsSync(VAULT_CONTRACTS_DIR)) {
    fs.mkdirSync(VAULT_CONTRACTS_DIR, { recursive: true });
}

/**
 * Write a single pending marker for retry tooling.
 * This is the ONLY side-effect on failure from this module.
 */
function writePendingMarker(projectId, reason) {
    const filename = `PENDING_${projectId}.json`;
    const filePath = path.join(VAULT_CONTRACTS_DIR, filename);
    const payload = {
        projectId,
        status: "pending",
        chain: "XRPL-testnet",
        reason: String(reason || "unknown"),
        timestamp: new Date().toISOString(),
    };

    try {
        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
        logEvent("warn", "Contract marked pending for retry", { projectId, filePath });
        return { ok: true, filePath };
    } catch (err) {
        logEvent("error", "Failed to write pending marker", { projectId, message: err.message });
        return { ok: false, error: err.message };
    }
}

/**
 * Deploy a "contract" to the requested chain.
 * For XRPL, delegates to xrplClient.mintProjectOnXRPL which:
 *  - signs and submits to XRPL (with retries)
 *  - on success: writes Vault artifact, syncs DAO, and notifies Fidelity (inside that module)
 *
 * @param {Object} args
 * @param {string} args.projectId
 * @param {string} args.chain - e.g. "XRPL-testnet"
 * @param {string} args.projectType - e.g. "investment"
 *
 * @returns {Promise<{ok:boolean, chain:string, address?:string, txHash?:string, ledgerIndex?:number}>}
 */
async function deploySmartContract({ projectId, chain, projectType = "investment" }) {
    if (!projectId) {
        throw new Error("deploySmartContract: projectId is required");
    }
    if (!chain) {
        throw new Error("deploySmartContract: chain is required");
    }

    logEvent("info", "⚙️ Deploying smart contract", { projectId, chain, projectType });

    // XRPL family
    if (chain.toUpperCase().startsWith("XRPL")) {
        try {
            const { ok, txHash, ledgerIndex, address } = await mintProjectOnXRPL({
                projectId,
                projectType,
            });

            // No post-actions here—xrplClient already handled Vault/DAO/Fidelity on success.
            if (ok) {
                logEvent("success", "XRPL deploy successful", {
                    projectId,
                    chain,
                    address,
                    txHash,
                    ledgerIndex,
                });
                return { ok: true, chain, address, txHash, ledgerIndex };
            }

            // If xrplClient returns ok:false (unlikely; it throws on failure),
            // mark pending and bubble up a clean error.
            writePendingMarker(projectId, "xrplClient reported ok:false");
            throw new Error("XRPL deployment reported failure");
        } catch (err) {
            // Mark a single pending file for retry tool, then throw
            writePendingMarker(projectId, err.message || err);
            logEvent("error", "❌ Contract deployment failed", { projectId, chain, err: err.message });
            throw err;
        }
    }

    // Other chains (EVM, XRPL mainnet variants, etc.) would be added here later.
    const msg = `Unsupported chain '${chain}' in deploySmartContract`;
    logEvent("error", msg, { projectId, chain });
    throw new Error(msg);
}

module.exports = {
    deploySmartContract,
};
