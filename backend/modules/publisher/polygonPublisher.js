
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

// © 2025 AG Holdings | BLC Compliance Publisher
// Publishes compliance proof hashes to Polygon via Gnosis Safe
// Emits real-time events to CoinPurse Dashboard for investor transparency.

const { ethers } = require("ethers");
const Safe = require("@safe-global/protocol-kit").default;
const SafeApiKit = require("@safe-global/api-kit").default;
const { EthersAdapter } = require("@safe-global/protocol-kit");
const fs = require("fs");

// Keep Safe SDK persistent across invocations
let safeSdk = null;

/**
 * Publishes a compliance proof hash to Polygon via Gnosis Safe multisig
 * @param {Object} report - Daily compliance snapshot
 * @param {Object} proof - zkETF proof object with proofHash
 * @param {Object} io - Socket.io server instance
 * @returns {Promise<string>} safeTxHash or transaction hash
 */
async function publishComplianceHashToPolygon(report, proof, io) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const safeAddress = process.env.COMPLIANCE_SAFE_ADDRESS;
        const ownerKey = process.env.SAFE_SIGNER_PRIVATE_KEY;

        if (!safeAddress || !ownerKey) {
            throw new Error("Missing COMPLIANCE_SAFE_ADDRESS or SAFE_SIGNER_PRIVATE_KEY in .env");
        }

        // Reuse existing Safe SDK if already initialized
        if (!safeSdk) {
            const owner = new ethers.Wallet(ownerKey, provider);
            const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: owner });
            safeSdk = await Safe.create({ ethAdapter, safeAddress });
            console.log(`✅ Gnosis Safe initialized for compliance: ${safeAddress}`);
        }

        // Initialize Safe API service
        const apiKit = new SafeApiKit({
            txServiceUrl: "https://safe-transaction-polygon.safe.global",
            ethAdapter: safeSdk.getEthAdapter(),
        });

        // Construct compliance payload
        const message = `BLC_SNAPSHOT_${report.date}_${proof.proofHash}`;
        const txData = ethers.hexlify(Buffer.from(message));

        // Create Safe transaction
        const tx = await safeSdk.createTransaction({
            safeTransactionData: {
                to: "0x000000000000000000000000000000000000dEaD", // burn/anchor
                data: txData,
                value: "0",
            },
        });

        // Sign + propose transaction
        const signedTx = await safeSdk.signTransaction(tx);
        const response = await apiKit.proposeTransaction({
            safeAddress,
            safeTransactionData: signedTx.data,
            senderAddress: safeSdk.getEthAdapter().getSignerAddress(),
        });

        const txHash = response.safeTxHash || response.transactionHash;
        console.log(`✅ Compliance snapshot proposed via Gnosis Safe: ${txHash}`);

        // Optional local backup log
        const logDir = "analytics/compliance";
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(
            `${logDir}/compliance_tx.log`,
            `[${new Date().toISOString()}] ${txHash} | ${proof.proofHash}\n`,
            "utf8"
        );

        // Emit real-time update to dashboard (safe emit)
        if (io && io.emit) {
            io.emit("complianceEvent", {
                status: "anchored",
                timestamp: new Date().toISOString(),
                txHash,
                proofHash: proof.proofHash,
                reportDate: report.date,
            });
            console.log("📡 complianceEvent emitted to dashboard");
        }

        return txHash;
    } catch (err) {
        console.error("❌ publishComplianceHashToPolygon error:", err.message);

        // Fallback log for failed attempts
        fs.appendFileSync(
            "analytics/compliance/error.log",
            `[${new Date().toISOString()}] ERROR: ${err.message}\n`,
            "utf8"
        );

        return null;
    }
}

module.exports = { publishComplianceHashToPolygon };
