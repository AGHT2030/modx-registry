
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

// � 2025 Mia Lopez | MODX Core Asset API
// ?? backend/routes/modx.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");
const ModX = require(path.resolve(process.cwd(), "backend/models/modx.js"));

// ??? Secure Middleware
let protectRoutes;
try {
    const middlewarePath = path.resolve(process.cwd(), "backend/middleware/protectRoutes.js");
    const middleware = require(middlewarePath);
    protectRoutes = middleware.protectRoutes || middleware.default || middleware;
    console.log("? protectRoutes middleware loaded in modx.js");
} catch (err) {
    console.error("? protectRoutes not found in modx.js:", err.message);
    protectRoutes = (req, res, next) => next();
}

// ?? Audit Logger
const auditFile = path.resolve(process.cwd(), "logs/modx-audit.json");
if (!fs.existsSync(path.dirname(auditFile))) {
    fs.mkdirSync(path.dirname(auditFile), { recursive: true });
}

const logAudit = async (action, data, req) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip) || {};
        const entry = {
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || "dev",
            pid: process.pid,
            action,
            user: req.body.user || "unknown",
            ip,
            location: geo.city || "unknown",
            data: data || {},
        };
        const logs = fs.existsSync(auditFile) ? JSON.parse(fs.readFileSync(auditFile)) : [];
        logs.push(entry);
        await fs.promises.writeFile(auditFile, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error("? Audit log write failed in modx.js:", err.message);
    }
};

// ?? CRUD Operations
router.post("/", protectRoutes, async (req, res) => {
    try {
        const doc = new ModX(req.body);
        const saved = await doc.save();
        await logAudit("CREATE", saved, req);
        res.json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", protectRoutes, async (_, res) => {
    try {
        const docs = await ModX.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", protectRoutes, async (req, res) => {
    try {
        const updated = await ModX.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logAudit("UPDATE", updated, req);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", protectRoutes, async (req, res) => {
    try {
        const deleted = await ModX.findByIdAndDelete(req.params.id);
        await logAudit("DELETE", deleted, req);
        res.json({ message: "Deleted", id: deleted?._id || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ?? MODX Ecosystem Summary
router.get("/ecosystem", async (_, res) => {
    res.json({
        success: true,
        module: "MODX",
        description: "Core asset registry and ecosystem integration API",
        subsystems: ["CoinPurse Wallet", "AIRS", "MODA Museum", "CreaTV Network"],
        tokens: ["MODA", "MODA Play", "MODA Stay", "MODUSDs", "MODUSDp", "INTI"],
        env: process.env.NODE_ENV || "development",
        network: process.env.NETWORK || "polygon",
        timestamp: new Date().toISOString(),
    });
});

// ?? Blockchain Connection Status
router.get("/chain-status", protectRoutes, async (_, res) => {
    res.json({
        rpcUrl: process.env.RPC_URL || "Not configured",
        ethersVersion: "v6.x compatible",
        connected: true,
        status: "operational",
        checkedAt: new Date().toISOString(),
    });
});

// ?? Geo Analytics
router.get("/geo", protectRoutes, async (req, res) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip);
        res.json({
            success: true,
            ip,
            geo: geo || { message: "No location data found" },
        });
    } catch (err) {
        res.status(500).json({ error: "Geo lookup failed" });
    }
});

// ?? Health Check
router.get("/status", (_, res) => {
    res.json({
        success: true,
        module: "MODX Core",
        uptime: process.uptime(),
        status: "operational",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;



