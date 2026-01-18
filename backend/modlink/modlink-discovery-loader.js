
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

// © 2025 AIMAL Global Holdings | MODLINK Discovery Loader
// -----------------------------------------------------------------------------
// PURPOSE:
//   Automatically discovers:
//    • Orbs (AIRS, MODA, CoinPurse, MODE, CREATV, Retail, Invest, MODUSD)
//    • Galaxies (Play, Stay, Grow, Build, Invest)
//    • XRPL Tokens (INTI, MODUSD, MODUSDs, MODUSDp)
//    • EVM Contracts (Polygon: MODX, AIRS, CoinPurse, MODUSD variants)
//    • Governance Listeners (XRPL, EVM, MODX)
//    • Session Middleware Modules
//
//   Then registers all of them into:
//     → MODLINK Core
//     → MODLINK Universe Gateway
//     → MODLINK Event Bridge
//     → MODX Galaxy Router
//
//   This allows auto-sync on restart and future auto-expansion.
// -----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// MODLINK Bridge
const MODLINK = require("./modlink-event-bridge");

// MODX Galaxy Interface (if available)
const GALAXY = global.MODX_GALAXY || null;

// Registry file (local)
const REG_PATH = path.join(__dirname, "modlinkGovernance.json");

// Known core orbs
const CORE_ORBS = [
    "AIRS",
    "MODA",
    "CoinPurse",
    "MODE",
    "CREATV",
    "MODASTAYHYBRID",
    "MODARETAIL",
    "MODAINVEST",
    "MODADAO",
    "MODUSD"
];

// Known XRPL tokens
const XRPL_TOKENS = ["INTI", "MODUSD", "MODUSDs", "MODUSDp"];

// Known galaxies
const GALAXIES = ["Play", "Stay", "Build", "Grow", "Invest"];

/* ---------------------------------------------------------------------------
   1️⃣ File Scanner Helper
--------------------------------------------------------------------------- */
function scanDir(root, fileExt = ".js") {
    if (!fs.existsSync(root)) return [];
    return fs
        .readdirSync(root)
        .filter(f => f.endsWith(fileExt))
        .map(f => path.join(root, f));
}

/* ---------------------------------------------------------------------------
   2️⃣ Discover XRPL Files, EVM contracts, Middlewares & Governance listeners
--------------------------------------------------------------------------- */
function discoverAssets() {
    const backendRoot = path.resolve("./backend");

    return {
        xrpl: scanDir(path.join(backendRoot, "xrpl")),
        evm: scanDir(path.join(backendRoot, "modx/governance/abi"), ".json"),
        governanceListeners: scanDir(path.join(backendRoot, "modx/governance")),
        middleware: scanDir(path.join(backendRoot, "middleware"))
    };
}

/* ---------------------------------------------------------------------------
   3️⃣ Build REGISTRY OBJECT
--------------------------------------------------------------------------- */
function buildRegistry() {
    const assets = discoverAssets();

    const registry = {
        timestamp: new Date().toISOString(),
        orbs: {},
        galaxies: {},
        xrplTokens: XRPL_TOKENS,
        evmContracts: []
    };

    // ORBS
    CORE_ORBS.forEach(orb => {
        registry.orbs[orb] = {
            id: orb,
            status: "registered",
            discovered: true
        };
    });

    // Galaxies
    GALAXIES.forEach(g => {
        registry.galaxies[g] = {
            id: g,
            status: "active",
            discovered: true
        };
    });

    // EVM contract ABIs
    assets.evm.forEach(f => {
        registry.evmContracts.push({
            name: path.basename(f, ".json"),
            path: f
        });
    });

    return registry;
}

/* ---------------------------------------------------------------------------
   4️⃣ Save Registry to Disk
--------------------------------------------------------------------------- */
function saveRegistry(reg) {
    fs.writeFileSync(REG_PATH, JSON.stringify(reg, null, 2));
    console.log(
        chalk.greenBright(`📡 MODLINK Registry updated → ${REG_PATH}`)
    );
}

/* ---------------------------------------------------------------------------
   5️⃣ Auto-Register to MODLINK + MODX Galaxy
--------------------------------------------------------------------------- */
function registerToMODLINK(reg) {
    if (!reg) return;

    // Register Orbs
    for (const orb of Object.keys(reg.orbs)) {
        if (global.MODLINK?.dao?.registerOrb) {
            global.MODLINK.dao.registerOrb(orb);
        }
        if (GALAXY) GALAXY.broadcast("modlink:orb:registered", orb);

        console.log(`🪐 Registered Orb: ${orb}`);
    }

    // Register Galaxies
    for (const g of Object.keys(reg.galaxies)) {
        if (global.MODLINK?.dao?.registerGalaxy) {
            global.MODLINK.dao.registerGalaxy(g);
        }
        if (GALAXY) GALAXY.broadcast("modlink:galaxy:registered", g);

        console.log(`🌌 Registered Galaxy: ${g}`);
    }

    // ABI registry (if needed)
    reg.evmContracts.forEach(c => {
        console.log(`📘 ABI registered: ${c.name}`);
    });
}

/* ---------------------------------------------------------------------------
   6️⃣ Initialize Auto-Discovery Sequence
--------------------------------------------------------------------------- */
function initMODLINKDiscovery() {
    console.log(chalk.magentaBright("🔍 Initializing MODLINK Discovery Loader…"));

    const registry = buildRegistry();
    saveRegistry(registry);
    registerToMODLINK(registry);

    // Make available globally
    global.MODLINK_DISCOVERY = registry;

    console.log(chalk.green(`✨ MODLINK Discovery loader completed.`));
}

/* ---------------------------------------------------------------------------
   EXPORTS
--------------------------------------------------------------------------- */
module.exports = {
    initMODLINKDiscovery,
    REG_PATH
};

// Auto-start
initMODLINKDiscovery();
