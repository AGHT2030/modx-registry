
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
// Dynamically registers all DAO governance modules under MODLINK
// Extended to include CoinPurse route aggregator for unified backend routing

const fs = require("fs");
const path = require("path");
const logger = require("../../logger");
const express = require("express");

const daoDir = __dirname;
const daoRegistry = {}; // DAO registry object

/**
 * 🧭 Auto-load all DAO modules
 */
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

/**
 * 🔍 Retrieve DAO module by name
 * @param {string} name DAO identifier (e.g., "HealthDAO")
 */
function getDAO(name) {
    return daoRegistry[name] || null;
}

/**
 * ✅ Validate input via DAO
 */
function validateDAO(name, data) {
    const dao = getDAO(name);
    if (!dao) return { ok: false, reason: `DAO ${name} not found` };
    try {
        return dao.validate(data);
    } catch (err) {
        logger?.error?.(`DAO ${name} validation error:`, err);
        return { ok: false, reason: err.message };
    }
}

/* ---------------------------------------------------------
   🔗 COINPURSE ROUTE AGGREGATOR (Backend Extension)
--------------------------------------------------------- */
const router = express.Router();

try {
    const coinpurseRoutesPath = path.join(__dirname, "../routes");
    if (fs.existsSync(coinpurseRoutesPath)) {
        const coinpurseRoutes = require(coinpurseRoutesPath);
        router.use("/coinpurse", coinpurseRoutes);
        logger?.info?.("✅ CoinPurse Unified Router initialized");
    } else {
        logger?.warn?.("⚠️ CoinPurse route directory not found, skipping integration");
    }
} catch (err) {
    logger?.error?.("❌ Failed to initialize CoinPurse Unified Router:", err);
}

module.exports = { daoRegistry, getDAO, validateDAO, router };
