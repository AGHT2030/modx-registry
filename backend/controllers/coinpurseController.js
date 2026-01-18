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

// © 2025 Mia Lopez | CoinPurse Controller
// -------------------------------------------------------------------
// 💼 Unified Controller for CoinPurse Hybrid Wallet
// PRE-LAUNCH PATCH F ENABLED:
//   • Safe-mode XRPL transfers
//   • Safe-mode EVM transfers
//   • Never crashes on network failure
//   • Always returns JSON
// -------------------------------------------------------------------

const fs = require("fs");
const path = require("path");

// XRPL + EVM wallet references (safe mode compatible)
const xrplWallet = global.XRPL_WALLET || null;
const evmWallet = global.CoinPurseWallet || null;

// -------------------------------------------------------------------
// 🧾 Utility: Write audit log to AGVault
// -------------------------------------------------------------------
function writeAuditLog(entry) {
    try {
        const dir = path.resolve(__dirname, "../../../AGVault/investment/projects");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const file = path.join(dir, `TX-${Date.now()}.json`);
        fs.writeFileSync(file, JSON.stringify(entry, null, 2));
        console.log(`🧾 Audit log written to: ${file}`);
    } catch (err) {
        console.error("❌ Failed to write audit log:", err);
    }
}

// -------------------------------------------------------------------
// SAFE BALANCE CHECK
// -------------------------------------------------------------------
async function safeBalanceCheck(token, address) {
    try {
        if (token?.network === "xrpl" && xrplWallet) {
            return await xrplWallet.getBalances(address);
        }
        if (token?.network === "evm" && evmWallet) {
            return await evmWallet.getERC20Balance(token.address, address);
        }
    } catch (err) {
        console.warn("⚠ Balance check failed:", err);
    }
    return { safeMode: true, balance: "0" };
}

module.exports = {

    // ------------------------------------------------------------
    // ✅ STATUS CHECK
    // ------------------------------------------------------------
    status: (req, res) =>
        res.json({
            module: "CoinPurse Hybrid",
            status: "operational",
            timestamp: Date.now(),
        }),

    // ------------------------------------------------------------
    // 💸 LEGACY TRANSFER (kept for fallback)
    // ------------------------------------------------------------
    transfer: (req, res) => {
        console.log("💸 Legacy Transfer initiated:", req.body);
        const transaction = { ...req.body, id: Date.now() };

        writeAuditLog({ type: "legacy-transfer", transaction });

        res.json({ success: true, transaction });
    },

    // ------------------------------------------------------------
    // 💰 FETCH BALANCE
    // ------------------------------------------------------------
    balance: async (req, res) => {
        console.log("💰 Fetching balance for:", req.params.userId);

        const response = {
            success: true,
            userId: req.params.userId,
            balance: 1000.0,
            currency: "MODA",
            timestamp: Date.now(),
        };

        res.json(response);
    },

    // ------------------------------------------------------------
    // 🔥 ADVANCED HYBRID TRANSFER ENGINE (Patch F)
    // ------------------------------------------------------------
    async transferHandler(req, res) {
        const { to, amount, token, session } = req.body;
        const from = session?.wallet?.address || "UNKNOWN";

        // ------------------------------------------------------------
        // Validate payload
        // ------------------------------------------------------------
        if (!to || !amount || !token) {
            return res.json({
                ok: false,
                safeMode: true,
                reason: "invalid_payload"
            });
        }

        console.log(`🔁 Processing CoinPurse transfer → ${amount} ${token.symbol || token.network} from ${from} → ${to}`);

        // ------------------------------------------------------------
        // XRPL TRANSFER (with SAFE MODE)
        // ------------------------------------------------------------
        if (token.network === "xrpl") {
            if (!xrplWallet) {
                console.warn("⚠ XRPL wallet unavailable — SAFE MODE");
                return res.json({
                    ok: false,
                    safeMode: true,
                    reason: "xrpl_unavailable"
                });
            }

            try {
                const tx = {
                    TransactionType: "Payment",
                    Account: from,
                    Destination: to,
                    Amount: String(amount)
                };

                const result = await xrplWallet.sendXRPLPayment(tx);

                writeAuditLog({
                    type: "xrpl-transfer",
                    from,
                    to,
                    amount,
                    result
                });

                return res.json({
                    ok: true,
                    network: "xrpl",
                    from,
                    to,
                    amount,
                    tx: result
                });
            } catch (err) {
                console.warn("⚠ XRPL transfer failed:", err);
                return res.json({
                    ok: false,
                    safeMode: true,
                    reason: "xrpl_transfer_failed"
                });
            }
        }

        // ------------------------------------------------------------
        // EVM TRANSFER (with SAFE MODE)
        // ------------------------------------------------------------
        if (token.network === "evm") {
            if (!evmWallet) {
                console.warn("⚠ EVM wallet unavailable — SAFE MODE");
                return res.json({
                    ok: false,
                    safeMode: true,
                    reason: "evm_unavailable"
                });
            }

            try {
                const tx = await evmWallet.transferERC20(token.address, to, amount);

                writeAuditLog({
                    type: "evm-transfer",
                    from,
                    to,
                    amount,
                    txHash: tx.hash
                });

                return res.json({
                    ok: true,
                    network: "evm",
                    from,
                    to,
                    amount,
                    txHash: tx.hash
                });
            } catch (err) {
                console.warn("⚠ EVM transfer failed:", err);
                return res.json({
                    ok: false,
                    safeMode: true,
                    reason: "evm_transfer_failed"
                });
            }
        }

        // ------------------------------------------------------------
        // UNKNOWN NETWORK
        // ------------------------------------------------------------
        return res.json({
            ok: false,
            safeMode: true,
            reason: "unknown_network"
        });
    },
};
