
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

// © 2025 AG Holdings | BLC Institutional Access Guard
// Purpose: Restrict ETF/Futures endpoints to institutional accounts only.

module.exports = function institutionalGuard(req, res, next) {
    try {
        const tier = req.headers["x-user-tier"] || req.query.tier || "retail";

        // Allow internal system calls (cron, zkETF, compliance bot)
        if (req.headers["x-internal-key"] === process.env.INTERNAL_API_KEY) {
            return next();
        }

        // Basic logic: only institutional or admin can access ETF endpoints
        if (tier.toLowerCase() === "institutional" || tier.toLowerCase() === "admin") {
            return next();
        }

        console.warn(`⛔ Unauthorized ETF access attempt: ${req.ip}`);
        return res.status(403).json({
            success: false,
            message: "Institutional access required for this endpoint.",
        });
    } catch (err) {
        console.error("💥 institutionalGuard error:", err);
        res.status(500).json({ success: false, message: "Internal guard error" });
    }
};
