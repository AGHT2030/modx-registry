
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

// © 2025 AG Holdings | Backup Route
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 🧱 GET /api/backup — list all backup files
router.get("/", (req, res) => {
    try {
        const backupDir = path.join(__dirname, "../../backups");
        if (!fs.existsSync(backupDir)) {
            return res.status(200).json({ message: "No backups available." });
        }
        const files = fs.readdirSync(backupDir);
        res.json({
            success: true,
            backups: files,
            total: files.length,
        });
    } catch (err) {
        console.error("❌ Backup route error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🧱 POST /api/backup — trigger manual backup script
router.post("/", (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFile = path.join(__dirname, `../../backups/db-backup-${timestamp}.json`);

        if (!fs.existsSync(path.dirname(backupFile))) {
            fs.mkdirSync(path.dirname(backupFile), { recursive: true });
        }

        // example: dump a placeholder JSON until real DB dump integration
        fs.writeFileSync(backupFile, JSON.stringify({ message: "Backup created", date: new Date() }, null, 2));

        res.status(201).json({ success: true, file: backupFile });
    } catch (err) {
        console.error("❌ Error creating backup:", err.message);
        res.status(500).json({ error: "Failed to create backup" });
    }
});

module.exports = router;


