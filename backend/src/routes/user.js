
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

// © 2025 AIMAL Global Holdings | User Management Route
// Provides authentication, user profile, and admin-only account management

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logger = require("../../../logger");

// 🧱 Mock user store — replace with Mongo model later
const users = [
    {
        id: 1,
        username: "admin",
        passwordHash: bcrypt.hashSync("admin123", 10),
        role: "ADMIN",
    },
    {
        id: 2,
        username: "guest",
        passwordHash: bcrypt.hashSync("guest123", 10),
        role: "USER",
    },
];

const JWT_SECRET = process.env.JWT_SECRET || "dev-user-secret";

// 🧩 POST /api/user/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find((u) => u.username === username);

        if (!user) return res.status(401).json({ error: "Invalid username" });
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({ status: "ok", token, role: user.role });
    } catch (err) {
        logger.error("❌ Login failed:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

// 👤 GET /api/user/profile
router.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ error: "Missing token" });

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ status: "ok", profile: decoded });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// 🧾 GET /api/user/ping
router.get("/ping", (req, res) => {
    res.json({ status: "ok", message: "User route active" });
});

module.exports = router;
