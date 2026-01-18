
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

// © 2025 AIMAL Global Holdings | MODLINK Galaxy Data Route
// Serves DAO + metric data for each galaxy and syncs with live MODLINK governance registry.

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 📂 Path to persistent governance registry
const GOVERNANCE_PATH = path.resolve("./backend/modlink/modlinkGovernance.json");

// 🧭 Helper: Load JSON safely
function loadGovernanceData() {
    try {
        if (!fs.existsSync(GOVERNANCE_PATH)) return [];
        const data = fs.readFileSync(GOVERNANCE_PATH, "utf-8");
        return JSON.parse(data || "[]");
    } catch (err) {
        console.error("⚠️ Failed to read modlinkGovernance.json:", err);
        return [];
    }
}

// 🧠 Helper: Find galaxy entry by ID or name
function findGalaxy(identifier) {
    const all = loadGovernanceData();
    return all.find(
        (g) =>
            g.id?.toLowerCase() === identifier?.toLowerCase() ||
            g.name?.toLowerCase() === identifier?.toLowerCase()
    );
}

// -----------------------------------------------------------
// 🛰️ GET /api/galaxy/:name
// Returns galaxy’s DAO + metrics + governance data.
// -----------------------------------------------------------
router.get("/:name", async (req, res) => {
    const { name } = req.params;

    try {
        const galaxy = findGalaxy(name);

        if (!galaxy) {
            return res.status(404).json({ error: "Galaxy not found", name });
        }

        // 🧩 Compose formatted response
        const response = {
            id: galaxy.id,
            name: galaxy.name,
            status: galaxy.status || "offline",
            lastPing: galaxy.lastPing || null,
            heartbeat: galaxy.heartbeat || 0,
            advisory: galaxy.advisory || null,
            metrics: galaxy.metrics || [
                { label: "Staked Value", value: "$0.00" },
                { label: "Active Nodes", value: "0" },
                { label: "Governance Votes", value: "0" },
                { label: "Twin Uptime", value: "0%" },
            ],
            governance: galaxy.governance || {
                proposal: "No active proposals",
                status: "Inactive",
            },
        };

        return res.json(response);
    } catch (err) {
        console.error("❌ Error in galaxyRoute:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// -----------------------------------------------------------
// ♻️ POST /api/galaxy/update
// Updates metrics or governance data for a galaxy (called by MODLINK DAO or AURA updates).
// -----------------------------------------------------------
router.post("/update", express.json(), async (req, res) => {
    const update = req.body;
    if (!update?.id && !update?.name)
        return res.status(400).json({ error: "Missing galaxy identifier" });

    try {
        const galaxies = loadGovernanceData();
        const idx = galaxies.findIndex(
            (g) =>
                g.id?.toLowerCase() === update.id?.toLowerCase() ||
                g.name?.toLowerCase() === update.name?.toLowerCase()
        );

        if (idx === -1)
            return res.status(404).json({ error: "Galaxy not found in registry" });

        galaxies[idx] = { ...galaxies[idx], ...update };
        fs.writeFileSync(GOVERNANCE_PATH, JSON.stringify(galaxies, null, 2));

        console.log(`✅ Galaxy ${update.name || update.id} updated in governance registry`);
        return res.json({ ok: true, galaxy: galaxies[idx] });
    } catch (err) {
        console.error("❌ Error updating galaxy:", err);
        res.status(500).json({ error: "Failed to update galaxy data" });
    }
});

module.exports = router;

