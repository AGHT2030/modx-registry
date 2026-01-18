
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

// © 2025 AIMAL Global Holdings | MODLINK Admin Auth
// Handles admin login and token generation for internal dashboards.

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logger = require("../logger");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@coinpurse.org";
const ADMIN_HASHED_PASSWORD = process.env.ADMIN_HASHED_PASSWORD || bcrypt.hashSync("securepassword", 10);
const JWT_SECRET = process.env.JWT_SECRET || "replace_this_secret_in_vault";

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email !== ADMIN_EMAIL) {
            logger.warn(`❌ Unauthorized admin attempt: ${email}`);
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const match = await bcrypt.compare(password, ADMIN_HASHED_PASSWORD);
        if (!match) {
            logger.warn(`⚠️ Invalid admin password for ${email}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ role: "admin", email }, JWT_SECRET, { expiresIn: "4h" });
        logger.info(`✅ Admin ${email} authenticated.`);
        res.json({ status: "ok", token });
    } catch (err) {
        logger.error("Admin login error:", err);
        res.status(500).json({ error: "Internal authentication error" });
    }
};

exports.verifyAdmin = (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.replace("Bearer ", "");
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") throw new Error("Invalid role");
        req.admin = decoded;
        next();
    } catch {
        res.status(403).json({ error: "Admin authorization failed" });
    }
};
