
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

// © 2025 AIMAL Global Holdings | DAO Logger
// Records all Vault + Contract + Project transactions to AGVault/trust/dao_logs
// Optionally syncs with MODLINK DAO endpoint for compliance tracking

const fs = require("fs");
const path = require("path");
const { getVaultPaths } = require("../hooks/useVaultPaths.cjs");
const { logEvent } = require("../hooks/useLogger.cjs");
const crypto = require("crypto");
const axios = require("axios");

// ─────────────────────────────────────────────────────────────
// DAO LOGGER — local + remote audit persistence
// ─────────────────────────────────────────────────────────────
async function recordDaoEvent(eventType, payload = {}) {
    try {
        const vault = getVaultPaths();
        const daoDir = vault.daoLogs;

        // Unique DAO log file per day
        const dateTag = new Date().toISOString().split("T")[0];
        const daoFile = path.join(daoDir, `dao_log_${dateTag}.json`);

        // Prepare entry
        const entry = {
            time: new Date().toISOString(),
            type: eventType,
            txHash: payload.hash || crypto.randomUUID(),
            projectId: payload.projectId || null,
            filePath: payload.filePath || null,
            wallet: payload.wallet || null,
            xrplTxId: payload.xrplTxId || null,
            fidelityRef: payload.fidelityRef || null,
            origin: "AGVault",
            status: "recorded",
        };

        let logs = [];
        if (fs.existsSync(daoFile)) {
            logs = JSON.parse(fs.readFileSync(daoFile, "utf8"));
        }
        logs.push(entry);
        fs.writeFileSync(daoFile, JSON.stringify(logs, null, 2));

        logEvent("success", "DAO Event Recorded", { eventType, projectId: entry.projectId, hash: entry.txHash });

        // Optional remote sync to MODLINK DAO endpoint
        if (process.env.MODLINK_DAO_ENDPOINT) {
            try {
                await axios.post(process.env.MODLINK_DAO_ENDPOINT, entry, {
                    headers: { Authorization: `Bearer ${process.env.MODLINK_DAO_TOKEN || ""}` },
                });
                logEvent("success", "DAO Remote Sync", { endpoint: process.env.MODLINK_DAO_ENDPOINT });
            } catch (apiErr) {
                logEvent("error", "DAO Remote Sync Failed", { message: apiErr.message });
            }
        }

        return entry;
    } catch (err) {
        logEvent("error", "DAO Logger Failure", { err });
        throw err;
    }
}

module.exports = { recordDaoEvent };
