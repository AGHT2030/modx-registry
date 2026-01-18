
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

/**
 * © 2025 Mia Lopez | MODX Ecosystem | secureAdmin.js
 * Protects API routes from unauthorized admin access
 * Validates JWT, role, and IP whitelist with rate limiting
 */

const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const auditLog = require("../utils/auditLog");

// ✅ IP whitelist from environment
const allowedIPs = process.env.ALLOWED_ADMIN_IPS?.split(",").map(ip => ip.trim()) || [];
const JWT_SECRET = process.env.JWT_SECRET || "super-secure-fallback-key";

// ✅ Rate limiter to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: "🚫 Too many requests from this IP. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Middleware to enforce admin-only access
 */
module.exports = function secureAdmin(req, res, next) {
    const token = req.headers["authorization"];

    if (!token || !token.startsWith("Bearer ")) {
        auditLog("🚫 Missing or malformed admin token", { ip: req.ip });
        return res.status(401).json({ error: "Unauthorized: Missing or malformed token" });
    }

    const jwtToken = token.split(" ")[1];

    try {
        const decoded = jwt.verify(jwtToken, JWT_SECRET);

        // ✅ Role check
        if (decoded.role !== "admin" && !decoded.isAdmin) {
            auditLog("⚠️ Non-admin attempted to access admin route", {
                email: decoded.email,
                ip: req.ip,
            });
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        // ✅ IP whitelist check (optional)
        const requesterIP =
            req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;

        if (allowedIPs.length > 0 && !allowedIPs.includes(requesterIP)) {
            auditLog("🚫 Unauthorized IP address attempted admin access", {
                email: decoded.email,
                ip: requesterIP,
            });
            return res.status(403).json({ error: "Forbidden: Unauthorized IP address" });
        }

        // ✅ Attach decoded user to req
        req.user = decoded;

        // ✅ Apply rate limiting + continue
        limiter(req, res, () => {
            auditLog("✅ Admin Verified Access", { email: decoded.email, ip: requesterIP });
            next();
        });
    } catch (err) {
        auditLog("❌ Admin JWT verification failed", { error: err.message, ip: req.ip });
        console.error("Admin middleware error:", err.message);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

