
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

// © 2025 AIMAL Global Holdings | Investor Access Dashboard API
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const LOG_FILE = path.join(process.cwd(), "logs/investor_access.jsonl");

// Fetch recent access logs
router.get("/logs", (req, res) => {
    try {
        if (!fs.existsSync(LOG_FILE)) return res.json([]);
        const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n");
        const data = lines.map((l) => JSON.parse(l));
        res.json(data.reverse().slice(0, 500)); // latest 500
    } catch (err) {
        console.error("Error reading access log:", err);
        res.status(500).send("Error loading logs");
    }
});

module.exports = router;
