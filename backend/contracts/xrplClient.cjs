
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

// © 2025 AIMAL Global Holdings | XRPL Client (v2.5 Ledger-Guardian Build)
// Handles XRPL minting, funding verification, DAO + Fidelity sync, and vault artifact logging.

const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config({ path: ".env.override" });
const xrpl = require("xrpl");

const { logEvent } = require("../hooks/useLogger.cjs");
const { writeVaultFile } = require("./vaultWriter.cjs");
const { syncDaoRecord } = require("../hooks/useDaoSync.cjs");
const { notifyFidelityContractDeployment } = require("./fidelityNotifier.cjs");

// -----------------------------------------------------
// Config & Environment
// -----------------------------------------------------
const XRPL_URL = process.env.XRPL_TESTNET_URL || "wss://s.altnet.rippletest.net:51233";
const MASTER_WALLET = process.env.AGH_MASTER_WALLET || ""; // optional (for display only)
const MASTER_SEED = process.env.AGH_MASTER_SEED || "";     // required to sign
const VAULT_PATH = path.resolve("AGVault/investment/contracts");
const XRPL_FUNDER_URL = "https://faucet.altnet.rippletest.net/accounts";

if (!fs.existsSync(VAULT_PATH)) fs.mkdirSync(VAULT_PATH, { recursive: true });

// -----------------------------------------------------
// Helper → Fund account via XRPL Faucet if needed
// -----------------------------------------------------
async function ensureFunding(address) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ destination: address });
        const req = https.request(
            XRPL_FUNDER_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data),
                },
            },
            (res) => {
                let raw = "";
                res.on("data", (chunk) => (raw += chunk));
                res.on("end", () => {
                    if (res.statusCode === 200) {
                        console.log(`💧 Faucet funding requested for ${address}`);
                        resolve(true);
                    } else {
                        console.warn(`⚠️ Faucet funding failed with ${res.statusCode} — ${raw || ""}`);
                        reject(new Error(`Faucet status ${res.statusCode}`));
                    }
                });
            }
        );
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

// -----------------------------------------------------
// Helper → Safely derive validated ledger index from submit result
// -----------------------------------------------------
function pickLedgerIndexFromSubmit(res) {
    // xrpl.js submitAndWait shapes can differ; try in order of likelihood
    return (
        res?.result?.validated_ledger_index ??
        res?.result?.ledger_index ??
        res?.result?.meta?.ledger_index ??
        res?.result?.tx_json?.ledger_index ??
        null
    );
}

// -----------------------------------------------------
// Helper → Fallback TX lookup by hash to obtain validated ledger index
// -----------------------------------------------------
async function getValidatedLedgerIndexByHash(client, txHash) {
    try {
        const tx = await client.request({
            command: "tx",
            transaction: txHash,
            binary: false,
        });
        // If validated, tx.result.validated should be true and ledger_index present
        if (tx?.result?.validated && Number.isInteger(tx.result.ledger_index)) {
            return tx.result.ledger_index;
        }
    } catch (e) {
        // swallow; we’ll leave ledgerIndex null if this fails
    }
    return null;
}

// -----------------------------------------------------
// Main Mint Handler — Submits ledger transactions with retry-safe watchdog
// -----------------------------------------------------
async function mintProjectOnXRPL({ projectId, projectType }) {
    console.log(`🔹 XRPL Mint Handler: { projectId: '${projectId}', chain: 'XRPL-testnet' }`);

    if (!MASTER_SEED) {
        console.warn("⚠️ Missing AGH_MASTER_SEED — cannot sign transactions. Set this in .env.override");
        throw new Error("Missing AGH_MASTER_SEED");
    }

    const client = new xrpl.Client(XRPL_URL);
    await client.connect();

    const wallet = xrpl.Wallet.fromSeed(MASTER_SEED);
    const address = wallet.address;

    // Ensure account exists/funded
    try {
        const info = await client.request({ command: "account_info", account: address });
        console.log(
            `🔹 XRPL Account Verified { address: '${address}', balance: '${info.result.account_data.Balance}' }`
        );
    } catch (err) {
        console.log(`🚰 Account not found or unfunded — requesting faucet funding...`);
        await ensureFunding(address);
        // Wait a beat for funding to settle
        await new Promise((r) => setTimeout(r, 2000));
    }

    let success = false;
    let resultPayload = {};

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            // Refresh account + window
            const acctInfo = await client.request({ command: "account_info", account: address });
            const current = await client.request({ command: "ledger_current" });
            const currentIndex = current?.result?.ledger_current_index || 0;
            const lastLedger = currentIndex + 300; // ~1 minute window

            console.log(
                `🔹 XRPL Mint Attempt { attempt: ${attempt}, ledgerWindow: ${lastLedger - currentIndex}, projectId: '${projectId}' }`
            );

            // Minimal, cheap TX: AccountSet with audit memos (swap to NFTokenMint/Payment later)
            const tx = {
                TransactionType: "AccountSet",
                Account: address,
                Fee: "12",
                Sequence: acctInfo.result.account_data.Sequence,
                LastLedgerSequence: lastLedger,
                Memos: [
                    {
                        Memo: {
                            MemoType: xrpl.convertStringToHex("Project"),
                            MemoData: xrpl.convertStringToHex(projectId),
                        },
                    },
                    {
                        Memo: {
                            MemoType: xrpl.convertStringToHex("Type"),
                            MemoData: xrpl.convertStringToHex(projectType || "investment"),
                        },
                    },
                ],
            };

            const signed = wallet.sign(tx);
            const res = await client.submitAndWait(signed.tx_blob);

            const outcome =
                res?.result?.meta?.TransactionResult ||
                res?.result?.engine_result ||
                "unknown";

            if (outcome === "tesSUCCESS") {
                // Ledger index (try from response, then fallback via tx lookup)
                let ledgerIndex = pickLedgerIndexFromSubmit(res);
                if (ledgerIndex == null) {
                    ledgerIndex = await getValidatedLedgerIndexByHash(client, signed.hash);
                }

                console.log(
                    `✅ XRPL Mint Success { projectId: '${projectId}', ledger: ${ledgerIndex ?? "unknown"} }`
                );

                success = true;
                resultPayload = {
                    ok: true,
                    txHash: signed.hash,
                    ledgerIndex,
                    address,
                };

                // ✅ Write artifact to vault
                const artifact = await writeVaultFile("contracts", `${projectId}_contract.json`, {
                    projectId,
                    chain: "XRPL-testnet",
                    address,
                    txHash: signed.hash,
                    ledgerIndex,
                    projectType: projectType || "investment",
                    timestamp: new Date().toISOString(),
                });

                // ✅ Sync DAO
                await syncDaoRecord({
                    eventType: "contract_deploy",
                    projectId,
                    chain: "XRPL-testnet",
                    txHash: signed.hash,
                    address,
                    metadata: { ledgerIndex, projectType: projectType || "investment" },
                });

                // ✅ Notify Fidelity
                await notifyFidelityContractDeployment({
                    projectId,
                    chain: "XRPL-testnet",
                    contractAddress: address,
                    txId: signed.hash,
                    artifactPath: artifact.filePath,
                    issuer: address,
                });

                break;
            }

            if (outcome === "temREDUNDANT" || `${outcome}`.includes("LastLedgerSequence")) {
                console.log("🕓 Ledger advanced mid-submit, refreshing sequence and retrying...");
                await new Promise((r) => setTimeout(r, 3000));
                continue;
            }

            console.log(`⚠️ XRPL Mint Error: ${outcome}`);
            await new Promise((r) => setTimeout(r, 4000));
        } catch (err) {
            console.log(`🔹 XRPL Mint Error { attempt: ${attempt}, err: '${err.message}' }`);
            await new Promise((r) => setTimeout(r, 5000));
        }
    }

    await client.disconnect();

    if (!success) {
        logEvent("error", "XRPL Mint Timeout", { projectId });
        throw new Error("❌ All XRPL mint attempts failed after watchdog retries.");
    }

    return resultPayload;
}

module.exports = { mintProjectOnXRPL };
