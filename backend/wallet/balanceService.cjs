// © 2025 AG Holdings Trust | Hybrid Wallet Balance Service
// ---------------------------------------------------------
// Safely returns balances from:
//   • XRPL (live or safe mode)
//   • EVM / Polygon (live or safe mode)
//   • MODA internal ledger (always available)
// ---------------------------------------------------------

const walletXRPL = require("./walletXRPL.cjs");
const walletEVM = require("./walletEVM.cjs");

// Fallback static ledger (works in SAFE MODE)
const internalLedger = {
    getMODABalance(address) {
        return 1000.0; // placeholder for launch week
    }
};

module.exports = {
    async getHybridBalance(userAddress) {
        let xrplBalance = null;
        let evmBalance = null;
        let modaBalance = null;

        // -------------------------------------------------
        // XRPL
        // -------------------------------------------------
        try {
            xrplBalance = await walletXRPL.getBalances(userAddress);
        } catch (err) {
            console.warn("⚠ XRPL balance fetch failed — SAFE MODE:", err.message);
            xrplBalance = { safeMode: true, balances: [] };
        }

        // -------------------------------------------------
        // EVM
        // -------------------------------------------------
        try {
            evmBalance = await walletEVM.getBalances(userAddress);
        } catch (err) {
            console.warn("⚠ EVM balance fetch failed — SAFE MODE:", err.message);
            evmBalance = { safeMode: true, balances: [] };
        }

        // -------------------------------------------------
        // MODA INTERNAL
        // -------------------------------------------------
        try {
            modaBalance = internalLedger.getMODABalance(userAddress);
        } catch {
            modaBalance = 0;
        }

        // Unified response
        return {
            address: userAddress,
            xrpl: xrplBalance,
            evm: evmBalance,
            moda: modaBalance,
            combinedValueUSD: this.estimateUSDValue({
                xrplBalance,
                evmBalance,
                modaBalance
            }),
            timestamp: new Date().toISOString()
        };
    },

    // -----------------------------------------------------
    // Simple NAV → USD converter (can replace with oracle)
    // -----------------------------------------------------
    estimateUSDValue({ xrplBalance, evmBalance, modaBalance }) {
        let total = 0;

        try {
            total += modaBalance * 1.0; // placeholder for MODA = $1
        } catch { }

        // XRPL tokens
        try {
            if (xrplBalance?.balances) {
                xrplBalance.balances.forEach(b => {
                    if (b.value) total += Number(b.value);
                });
            }
        } catch { }

        // EVM tokens
        try {
            if (evmBalance?.balances) {
                evmBalance.balances.forEach(b => {
                    if (b.value) total += Number(b.value);
                });
            }
        } catch { }

        return total;
    }
};
