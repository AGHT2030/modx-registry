
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

﻿// © 2025 Mia Lopez | Developer & IP Owner of CoinPurse™
// Protected by patent and trademark laws.
// Any request for architecture, API, or usage must be directed to Mia Lopez.

// 📂 backend/routes/adminRoutes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const router = express.Router(); // ✅ ensure router initialized first

// 🔐 Middlewares
const authenticateToken = require("../middleware/verifyJWT");
const secureAdmin = require("../middleware/secureAdmin");
const validate = require("../utils/middlewareValidator");
const auditLog = require("../utils/auditLog");
const protectRoutes = require("../middleware/protectRoutes"); // ✅ use default export

const JWT_SECRET = process.env.JWT_SECRET || "super_secure_jwt_secret_key";

// 🔧 Security Headers + CORS
router.use(cors());
router.use(helmet());

// 📁 Ensure logs directory exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logPath = path.join(logDir, "admin-access.log");

// ✅ Health check
router.get("/status", (req, res) => {
    res.status(200).json({
        service: "admin",
        status: "operational",
        timestamp: new Date().toISOString(),
    });
});

// ✅ Root public route
router.get("/", (req, res) => {
    res.status(200).json({ message: "✅ Admin route is working" });
});

// 🔐 Admin login route
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const isValid = email === "admin@coinpurse.org" && password === "securepassword";
    const now = new Date().toISOString();

    if (!isValid) {
        fs.appendFileSync(logPath, `${now} - LOGIN FAILED - ${email}\n`);
        auditLog("🔑 Admin Login Failed", { email, ip: req.ip });
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { id: "admin123", email, role: "admin", isAdmin: true };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    fs.appendFileSync(logPath, `${now} - LOGIN SUCCESS - ${email}\n`);
    fs.appendFileSync(logPath, `${now} - TOKEN ISSUED: ${token.slice(0, 12)}...${token.slice(-6)}\n`);
    auditLog("🔑 Admin Login Success", { email, ip: req.ip });

    res.json({ token, message: "Login successful", role: payload.role });
});

// 🛡️ Protected Admin Dashboard
router.get(
    "/dashboard",
    protectRoutes,
    validate("secureAdmin", secureAdmin),
    (req, res) => {
        if (!req.user?.isAdmin) {
            auditLog("⚠️ Unauthorized Dashboard Access", { user: req.user?.email, ip: req.ip });
            return res.status(403).json({ error: "Admin access required" });
        }

        fs.appendFileSync(logPath, `${new Date().toISOString()} - DASHBOARD ACCESS - ${req.user.email}\n`);
        auditLog("📊 Dashboard Accessed", { user: req.user.email, ip: req.ip });

        res.json({
            success: true,
            message: "Welcome to the secure admin dashboard 👑",
            admin: req.user,
            timestamp: new Date().toISOString(),
        });
    }
);

// ✅ Update Admin Settings (Protected)
router.post(
    "/settings",
    protectRoutes,
    validate("secureAdmin", secureAdmin),
    async (req, res) => {
        try {
            fs.appendFileSync(logPath, `${new Date().toISOString()} - SETTINGS UPDATED - ${req.user?.email}\n`);
            auditLog("⚙️ Admin Settings Updated", { user: req.user?.email, ip: req.ip });
            res.json({ message: "✅ Admin settings updated successfully" });
        } catch (err) {
            auditLog("❌ Admin Settings Update Failed", { error: err.message });
            res.status(500).json({ message: "❌ Failed to update settings", error: err.message });
        }
    }
);

// ✅ View Admin Logs (Protected)
router.get(
    "/logs",
    protectRoutes,
    validate("secureAdmin", secureAdmin),
    (req, res) => {
        if (!req.user?.isAdmin) {
            auditLog("⚠️ Unauthorized Log Access", { user: req.user?.email, ip: req.ip });
            return res.status(403).json({ error: "Admin access required" });
        }

        try {
            const logContent = fs.readFileSync(logPath, "utf-8");
            auditLog("📂 Admin Logs Viewed", { user: req.user.email, ip: req.ip });
            res.send(`<pre>${logContent}</pre>`);
        } catch (err) {
            auditLog("❌ Admin Log Fetch Failed", { error: err.message });
            res.status(500).json({ error: "Failed to read logs" });
        }
    }
);

module.exports = router;
