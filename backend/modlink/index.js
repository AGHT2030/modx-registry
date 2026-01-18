
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

// © 2025 AIMAL Global Holdings | MODLINK DAO Index Loader
// Unified DAO Registry, Governance Sync, and CoinPurse Aggregator

const fs = require("fs");
const path = require("path");
const express = require("express");
const logger = require("../../logger");

const router = express.Router();
let io = null;

try {
    const { io: auraIO } = require("../aura/aura-spectrum");
    io = auraIO;
    logger?.info?.("🔌 MODLINK connected to AURA Socket.IO layer");
} catch (err) {
    logger?.warn?.("⚠️ MODLINK could not attach to AURA spectrum:", err.message);
}

// ---------------------------------------------------------
// 🧭 Auto-load all DAO modules dynamically
// ---------------------------------------------------------
const daoDir = __dirname;
const daoRegistry = {};

fs.readdirSync(daoDir)
    .filter((file) => file.endsWith("DAO.js"))
    .forEach((file) => {
        try {
            const daoModule = require(path.join(daoDir, file));
            if (daoModule.name && daoModule.validate) {
                daoRegistry[daoModule.name] = daoModule;
                logger?.info?.(`✅ DAO Registered: ${daoModule.name}`);
            } else {
                logger?.warn?.(`⚠️ Invalid DAO file structure in ${file}`);
            }
        } catch (err) {
            logger?.error?.(`❌ Failed to load DAO file ${file}:`, err);
        }
    });

// ---------------------------------------------------------
// 🏛️ Governance Registration Endpoint
// ---------------------------------------------------------
router.post("/api/governance/register", (req, res) => {
    const { galaxy, token, status, timestamp } = req.body;
    const authToken = process.env.MODLINK_GOVERNANCE_TOKEN;

    if (!galaxy)
        return res.status(400).json({ error: "Missing galaxy field" });
    if (token !== authToken)
        return res.status(403).json({ error: "Unauthorized governance token" });

    const record = {
        galaxy,
        status: status || "active",
        timestamp: timestamp || new Date().toISOString(),
    };

    // 🪙 Save registration persistently
    const govPath = path.resolve("backend/modlink/modlinkGovernance.json");
    let currentData = { registeredGalaxies: [] };
    if (fs.existsSync(govPath)) {
        try {
            currentData = JSON.parse(fs.readFileSync(govPath, "utf8"));
        } catch {
            currentData = { registeredGalaxies: [] };
        }
    }

    // Deduplicate by galaxy
    const updated = currentData.registeredGalaxies.filter(
        (g) => g.galaxy !== record.galaxy
    );
    updated.push(record);

    fs.writeFileSync(
        govPath,
        JSON.stringify({ registeredGalaxies: updated }, null, 2)
    );

    logger?.info?.(`🏛️ MODLINK DAO Registered Galaxy: ${galaxy}`);
    console.log(`🏛️ Governance Registration Saved → ${govPath}`);

    // 🌐 Emit governance broadcast to all connected galaxies
    if (io) io.emit("modlink:policy:update", record);

    return res.status(200).json({ ok: true, ...record });
});

// ---------------------------------------------------------
// 🔗 CoinPurse Route Aggregator (Backend Extension)
// ---------------------------------------------------------
try {
    const coinpurseRoutesPath = path.join(__dirname, "../routes/api/coinpurseHybrid");
    if (fs.existsSync(coinpurseRoutesPath)) {
        const coinpurseRoutes = require(coinpurseRoutesPath);
        router.use("/coinpurse", coinpurseRoutes);
        logger?.info?.("✅ CoinPurse Unified Router initialized");
    }
} catch (err) {
    logger?.error?.("❌ Failed to initialize CoinPurse Unified Router:", err);
}

// ---------------------------------------------------------
// 🧭 Exports
// ---------------------------------------------------------
module.exports = { daoRegistry, router };
