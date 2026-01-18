
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

// backend/routes/modinvst.js
// © 2025 Mia Lopez | MODINVST Investor API

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");
const ModInvst = require(path.resolve(process.cwd(), "backend/models/modinvst.js"));

// Secure middleware loader
let protectRoutes;
try {
    const mwPath = path.resolve(process.cwd(), "backend/middleware/protectRoutes.js");
    const mw = require(mwPath);
    protectRoutes = mw.protectRoutes || mw.default || mw;
    console.log("✅ protectRoutes loaded in modinvst.js");
} catch {
    protectRoutes = (req, res, next) => next();
}

// Audit log setup
const auditPath = path.resolve(process.cwd(), "logs/modinvst-audit.json");
if (!fs.existsSync(path.dirname(auditPath))) fs.mkdirSync(path.dirname(auditPath), { recursive: true });

const logAudit = async (action, data, req) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip) || {};
    const entry = {
        timestamp: new Date().toISOString(),
        action,
        ip,
        env: process.env.NODE_ENV || "dev",
        user: req.body.user || "unknown",
        location: geo.city || "unknown",
        data: data || {},
    };
    const logs = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath)) : [];
    logs.push(entry);
    await fs.promises.writeFile(auditPath, JSON.stringify(logs, null, 2));
};

// CRUD
router.post("/", protectRoutes, async (req, res) => {
    try {
        const doc = new ModInvst(req.body);
        const saved = await doc.save();
        await logAudit("CREATE", saved, req);
        res.json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", protectRoutes, async (_, res) => {
    try {
        const docs = await ModInvst.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", protectRoutes, async (req, res) => {
    try {
        const updated = await ModInvst.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logAudit("UPDATE", updated, req);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", protectRoutes, async (req, res) => {
    try {
        const deleted = await ModInvst.findByIdAndDelete(req.params.id);
        await logAudit("DELETE", deleted, req);
        res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;




