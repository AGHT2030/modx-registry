
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

// © 2025 AIMAL Global Holdings | MODLINK Admin Authentication Middleware
// Protects MODLINK routes and console using JWT-based admin verification.

const jwt = require("jsonwebtoken");
const logger = require("../../logger");

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "dev-admin-secret";

/**
 * Middleware: verifies admin JWT token from headers
 */
function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, ADMIN_SECRET);
        if (!decoded || decoded.role !== "admin") {
            throw new Error("Unauthorized role");
        }
        req.admin = decoded;
        logger?.info(`🔑 Admin verified: ${decoded.email}`);
        next();
    } catch (err) {
        logger?.warn("🚫 Admin auth failed:", err.message);
        res.status(403).json({ error: "Forbidden: Admin authorization required" });
    }
}

module.exports = adminAuth;
