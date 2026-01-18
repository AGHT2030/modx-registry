
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

// © 2025 AIMAL Global Holdings | MODLINK Core Router
// Handles core MODLINK routing, DAO gateway verification, persistence, and live heartbeats.

const express = require("express");
const fs = require("fs");
const path = require("path");
const { io, updateGalaxyCache } = require("../aura/aura-spectrum.js"); // Added updateGalaxyCache
const registry = require("./registry");
const { loadVault } = require("./vault");

const router = express.Router();

// ✅ Register route in the MODLINK registry
registry.registerRoute("/api/modlink");

// Load vault for secure DAO metadata
const vault = loadVault();

// --------------------------------------------------
// 🔹 Health and Diagnostics
// --------------------------------------------------
router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "MODLINK Gateway",
        timestamp: new Date().toISOString(),
        daos: registry.listRoutes(),
    });
});

// --------------------------------------------------
// 🔹 Basic DAO List (Diagnostics Only)
// --------------------------------------------------
router.get("/daos", (req, res) => {
    try {
        const daos = [
            "EducationDAO",
            "EntertainmentDAO",
            "EventsDAO",
            "FinanceDAO",
            "GovernanceDAO",
            "HealthDAO",
            "HospitalityDAO",
            "SustainabilityDAO",
        ];
        res.json({ daos });
    } catch (err) {
        console.error("DAO list error:", err);
        res.status(500).json({ error: "Failed to list DAOs" });
    }
});

// --------------------------------------------------
// 🔹 Vault Status
// --------------------------------------------------
router.get("/vault/status", (req, res) => {
    res.json({
        hasVault: !!vault,
        timestamp: vault?.timestamp || new Date().toISOString(),
        envFallback: !vault || Object.keys(vault).length === 0,
    });
});

// --------------------------------------------------
// 🔹 DAO Registry Export (reads from vault.json)
// --------------------------------------------------
router.get("/dao", (req, res) => {
    try {
        const vault = require("../../modlink/vault.json");
        res.json(vault.daos || {});
    } catch (err) {
        console.error("Failed to load DAO registry:", err);
        res.status(500).json({ error: "Failed to load DAO registry" });
    }
});

// --------------------------------------------------
// 🏛️ Governance Registration Endpoint (Auto-Sync Expansion)
// --------------------------------------------------
const DATA_PATH = path.resolve(__dirname, "modlinkGovernance.json");

// ✅ Ensure persistent governance file exists
if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ galaxies: [] }, null, 2));
    console.log("🆕 Created modlinkGovernance.json baseline file");
}

// 🔸 Helper: Write + Broadcast Galaxy Registration
function persistAndBroadcastGalaxy(galaxyData) {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
        const exists = data.galaxies.some((g) => g.id === galaxyData.id);

        if (!exists) {
            data.galaxies.push(galaxyData);
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

            // 🌌 Emit live event to Universe Gateway
            if (io && io.emit) {
                io.emit("universe:galaxy:registered", galaxyData);
                console.log(`✨ Galaxy registered + broadcasted: ${galaxyData.name}`);
            } else {
                console.warn("⚠️ Universe Gateway socket not initialized.");
            }

            // 🪐 Sync cache to AURA Spectrum for dashboards
            updateGalaxyCache(data.galaxies);
        } else {
            console.log(`🔁 Galaxy already exists: ${galaxyData.name}`);
        }
    } catch (err) {
        console.error("❌ Error persisting galaxy:", err);
    }
}

// 🔸 Route: Register Galaxy
router.post("/api/governance/register", (req, res) => {
    const { id, galaxy, name, token, status } = req.body;

    // Basic authorization check
    if (!galaxy || token !== process.env.MODLINK_GOVERNANCE_TOKEN) {
        return res.status(403).json({ error: "Unauthorized or missing galaxy field" });
    }

    const timestamp = new Date().toISOString();
    const galaxyData = {
        id: id || `gx-${Date.now()}`,
        name: name || galaxy,
        status: status || "active",
        lastPing: timestamp,
        heartbeat: 0,
    };

    console.log(`🏛️ MODLINK DAO → Registered Galaxy: ${galaxyData.name} @ ${timestamp}`);

    // Write to persistent JSON + emit socket event
    persistAndBroadcastGalaxy(galaxyData);

    res.status(200).json({ ok: true, galaxy: galaxyData });
});

// --------------------------------------------------
// ♻️ Auto-Reload Galaxies on Boot
// --------------------------------------------------
function reloadGalaxiesOnBoot() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
        const { galaxies } = data;

        galaxies.forEach((g) => {
            if (io && io.emit) io.emit("universe:galaxy:registered", g);
        });

        // 🪐 Sync cache to AURA Spectrum for fresh dashboard load
        updateGalaxyCache(galaxies);

        console.log(`♻️ Reloaded ${galaxies.length} galaxies into Universe Gateway`);
        return galaxies;
    } catch (err) {
        console.error("⚠️ Failed to reload galaxies:", err);
        return [];
    }
}

// Run once on load
const galaxies = reloadGalaxiesOnBoot();

// --------------------------------------------------
// 💫 Galaxy Status Heartbeat Loop
// --------------------------------------------------
function startGalaxyHeartbeat() {
    setInterval(() => {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
            const now = new Date().toISOString();

            data.galaxies.forEach((g) => {
                g.heartbeat = (g.heartbeat || 0) + 1;
                g.lastPing = now;

                // Emit heartbeat signal
                if (io && io.emit) {
                    io.emit("universe:galaxy:heartbeat", {
                        id: g.id,
                        name: g.name,
                        heartbeat: g.heartbeat,
                        timestamp: now,
                    });
                }
            });

            // Write back updated heartbeat data
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

            // 🔄 Push updated galaxy cache to AURA Spectrum
            updateGalaxyCache(data.galaxies);

            console.log(`💓 Heartbeat broadcast for ${data.galaxies.length} galaxies @ ${now}`);
        } catch (err) {
            console.error("❌ Heartbeat loop error:", err);
        }
    }, 30000); // every 30 seconds
}

startGalaxyHeartbeat();

// --------------------------------------------------
// 🚨 Galaxy Status-Recovery Monitor
// --------------------------------------------------
function startGalaxyRecoveryMonitor() {
    setInterval(() => {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
            const now = Date.now();
            let updated = false;

            data.galaxies.forEach((g) => {
                const last = new Date(g.lastPing || 0).getTime();
                const diffSec = (now - last) / 1000;

                // 60s threshold (≈2 heartbeats missed)
                if (diffSec > 60 && g.status !== "offline") {
                    g.status = "offline";
                    updated = true;
                    console.log(`🚨 Galaxy ${g.name} marked offline (missed ${diffSec}s)`);

                    if (io && io.emit) io.emit("universe:galaxy:offline", g);
                } else if (diffSec <= 60 && g.status === "offline") {
                    g.status = "active";
                    updated = true;
                    console.log(`✅ Galaxy ${g.name} recovered to active`);

                    if (io && io.emit) io.emit("universe:galaxy:online", g);
                }
            });

            if (updated) {
                fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

                // 🔄 Update AURA Spectrum cache when status changes
                updateGalaxyCache(data.galaxies);
            }
        } catch (err) {
            console.error("⚠️ Recovery monitor error:", err);
        }
    }, 45000); // check every 45 seconds
}

startGalaxyRecoveryMonitor();

module.exports = router;
