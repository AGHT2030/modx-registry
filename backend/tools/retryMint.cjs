
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

// © 2025 AIMAL Global Holdings | XRPL Retry Mint Utility (v1.5 Auto-Fund + Retry)
// Automatically funds unfunded XRPL testnet accounts via faucet API and retries PENDING mints.

const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config({ path: ".env.override" });
const { logEvent } = require("../hooks/useLogger.cjs");
const { mintProjectOnXRPL } = require("../contracts/xrplClient.cjs");
const { syncDaoRecord } = require("../hooks/useDaoSync.cjs");
const {
    notifyFidelityContractDeployment,
} = require("../contracts/fidelityNotifier.cjs");
const { writeVaultFile } = require("../contracts/vaultWriter.cjs");

const CONTRACTS_DIR = path.resolve("AGVault/investment/contracts");
const LOG_DIR = path.resolve("AGVault/investment/logs");

// Ensure folders exist
for (const dir of [CONTRACTS_DIR, LOG_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const XRPL_FUNDER_URL = "https://faucet.altnet.rippletest.net/accounts";
const MASTER_WALLET = process.env.AGH_MASTER_WALLET;
const XRPL_URL = process.env.XRPL_TESTNET_URL || "wss://s.altnet.rippletest.net:51233";

/**
 * Auto-funds the master XRPL wallet if it's unfunded or under reserve.
 */
async function ensureXRPLFunding() {
    return new Promise((resolve, reject) => {
        if (!MASTER_WALLET) {
            console.log("⚠️  Missing AGH_MASTER_WALLET in .env.override");
            return reject(new Error("Missing wallet address"));
        }

        console.log(`🔍 Checking XRPL account balance for ${MASTER_WALLET}...`);
        const xrpl = require("xrpl");
        const client = new xrpl.Client(XRPL_URL);

        (async () => {
            try {
                await client.connect();
                const info = await client.request({
                    command: "account_info",
                    account: MASTER_WALLET,
                });
                const balanceXRP = parseFloat(info.result.account_data.Balance) / 1_000_000;
                console.log(`💰 Account funded: ${balanceXRP.toFixed(2)} XRP`);
                await client.disconnect();

                if (balanceXRP < 20) {
                    console.log("⚠️  Balance low, topping up via faucet...");
                    await fundViaFaucet(MASTER_WALLET);
                }
                resolve();
            } catch (err) {
                console.log("🚰 Account not found — requesting faucet funding...");
                await fundViaFaucet(MASTER_WALLET).then(resolve).catch(reject);
            }
        })();
    });
}

/**
 * Requests funding from XRPL Testnet Faucet API.
 */
function fundViaFaucet(address) {
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
                        console.log(`✅ Faucet funded ${address} successfully.`);
                        fs.writeFileSync(
                            path.join(LOG_DIR, `FaucetFund_${Date.now()}.json`),
                            raw,
                            "utf8"
                        );
                        resolve();
                    } else {
                        reject(new Error(`Faucet API returned status ${res.statusCode}`));
                    }
                });
            }
        );
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

/**
 * Main Retry Mint Runner
 */
(async () => {
    console.log("🟡 Loaded environment: .env.override");
    console.log("🔍 Starting XRPL Retry Mint Utility (Auto-Fund + Retry)...");

    try {
        await ensureXRPLFunding();
    } catch (err) {
        console.log(`❌ Funding step failed: ${err.message}`);
    }

    const pendingFiles = fs
        .readdirSync(CONTRACTS_DIR)
        .filter((f) => f.startsWith("PENDING_") && f.endsWith(".json"));

    if (pendingFiles.length === 0) {
        console.log("✅ No pending contracts found.");
        return;
    }

    console.log(`🟡 Found ${pendingFiles.length} pending contract(s). Retrying...\n`);

    for (const file of pendingFiles) {
        const filePath = path.join(CONTRACTS_DIR, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
            const { projectId, chain } = data;

            console.log(`⚙️  Retrying XRPL mint for project: ${projectId}`);
            logEvent("info", "Retry Mint Initiated", { projectId });

            const result = await mintProjectOnXRPL({
                projectId,
                projectType: "investment",
            });

            if (!result.ok) {
                logEvent("warn", "Retry Mint Failed", { projectId, err: result.reason });
                const failPath = path.join(LOG_DIR, `XRPL_RETRY_FAIL_${projectId}.json`);
                fs.writeFileSync(
                    failPath,
                    JSON.stringify({ projectId, reason: result.reason, ok: false }, null, 2),
                    "utf8"
                );
                continue;
            }

            // Write success artifact
            const newFile = `${projectId}_contract.json`;
            const artifact = await writeVaultFile("contracts", newFile, {
                projectId,
                chain: chain || "XRPL-testnet",
                address: result.address,
                txHash: result.txHash,
                ledgerIndex: result.ledgerIndex,
                status: "validated",
                timestamp: new Date().toISOString(),
            });

            // Update DAO
            await syncDaoRecord({
                eventType: "contract_deploy_retry",
                projectId,
                chain,
                txHash: result.txHash,
                address: result.address,
                metadata: { ledgerIndex: result.ledgerIndex },
            });

            // Notify Fidelity
            try {
                await notifyFidelityContractDeployment({
                    projectId,
                    chain,
                    contractAddress: result.address,
                    txId: result.txHash,
                    artifactPath: artifact.filePath,
                    issuer:
                        process.env.AGH_MASTER_WALLET || "rEXAMPLE_AGH_MASTER_PLACEHOLDER",
                });
                logEvent("success", "Fidelity Notified (Retry)", { projectId });
            } catch (ferr) {
                logEvent("warn", "Fidelity Notification Skipped", {
                    projectId,
                    err: ferr.message,
                });
            }

            // Remove pending file and log success
            fs.unlinkSync(filePath);
            logEvent("success", "Retry Mint Success", {
                projectId,
                txHash: result.txHash,
                ledgerIndex: result.ledgerIndex,
            });
            console.log(`✅ Project ${projectId} successfully minted and validated.`);
        } catch (err) {
            console.error(`❌ Error retrying ${file}:`, err.message);
            logEvent("error", "Retry Mint Exception", { file, err: err.message });
        }
    }

    console.log("\n🎯 Retry sequence complete.");
})();

