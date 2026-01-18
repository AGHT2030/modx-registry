
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

// � 2025 Mia Lopez | MODA Museum + Hotel Route API
// ?? backend/routes/moda.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");
const Moda = require(path.resolve(process.cwd(), "backend/models/moda.js"));

// ??? Secure Middleware
let protectRoutes;
try {
    const mwPath = path.resolve(process.cwd(), "backend/middleware/protectRoutes.js");
    const mw = require(mwPath);
    protectRoutes = mw.protectRoutes || mw.default || mw;
    console.log("? protectRoutes loaded in moda.js");
} catch (err) {
    console.error("? protectRoutes not found in moda.js:", err.message);
    protectRoutes = (req, res, next) => next();
}

// ?? Audit Log
const logPath = path.resolve(process.cwd(), "logs/moda-audit.json");
if (!fs.existsSync(path.dirname(logPath))) {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
}

const logAudit = async (action, data, req) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip) || {};
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            env: process.env.NODE_ENV || "dev",
            ip,
            user: req.body.user || "unknown",
            location: geo.city || "unknown",
            data: data || {},
        };
        const logs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath)) : [];
        logs.push(entry);
        await fs.promises.writeFile(logPath, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error("? Audit log write failed:", err.message);
    }
};

// ?? CRUD � Museum + Hotel Data
router.post("/", protectRoutes, async (req, res) => {
    try {
        const doc = new Moda(req.body);
        const saved = await doc.save();
        await logAudit("CREATE", saved, req);
        res.json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", protectRoutes, async (req, res) => {
    try {
        const docs = await Moda.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", protectRoutes, async (req, res) => {
    try {
        const updated = await Moda.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logAudit("UPDATE", updated, req);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", protectRoutes, async (req, res) => {
    try {
        const deleted = await Moda.findByIdAndDelete(req.params.id);
        await logAudit("DELETE", deleted, req);
        res.json({ message: "Deleted", id: deleted?._id || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ?? Immersive Experience Preview
router.get("/immersive/preview", async (req, res) => {
    res.json({
        success: true,
        mode: "immersive",
        version: "1.0",
        themes: [
            "Digital Garden",
            "Holographic Skyline",
            "Underwater Metaverse",
            "Historic Memphis Revival",
        ],
        nextEvent: {
            title: "MODA NFT Gala",
            date: "2025-11-20",
            venue: "MODA Museum | 128 Adams Ave",
        },
    });
});

// ?? Geo Analytics
router.get("/analytics/geo", protectRoutes, async (req, res) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip);
        res.json({
            success: true,
            ip,
            geo: geo || { message: "No data found for IP" },
        });
    } catch (err) {
        res.status(500).json({ error: "Geo lookup failed" });
    }
});

// ?? Health Check
router.get("/status", (req, res) => {
    res.json({
        module: "MODA",
        subsystems: ["museum", "hotel", "immersive-experience"],
        uptime: process.uptime(),
        status: "operational",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;



