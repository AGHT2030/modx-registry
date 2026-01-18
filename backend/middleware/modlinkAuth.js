
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

// © 2025 Mia Lopez | MODLINK Auth Middleware
// 🔒 Used by AURA Whisper, AIRS, and CoinPurse services to verify API / contract auth

const { ethers } = require("ethers");

/**
 * Middleware to validate MODLINK or on-chain signed requests.
 * Falls back to open mode if credentials not provided.
 */
module.exports = {
    verifyModlinkAuth: async (req, res, next) => {
        try {
            const { authorization, signature, address } = req.headers;

            // No signature? Skip validation in dev mode
            if (!signature || !address) {
                console.warn("⚠️  [modlinkAuth] No signature provided — skipping verification.");
                return next();
            }

            // Simplified message validation (can be extended to EIP-712 later)
            const recovered = ethers.utils.verifyMessage("MODLINK_AUTH", signature);

            if (recovered.toLowerCase() !== address.toLowerCase()) {
                console.error("❌ [modlinkAuth] Invalid signature — unauthorized.");
                return res.status(401).json({ success: false, error: "Unauthorized signature" });
            }

            req.authAddress = recovered;
            return next();
        } catch (err) {
            console.error("❌ [modlinkAuth] Verification error:", err.message);
            return res.status(500).json({ success: false, error: "Auth middleware failure" });
        }
    },
};
