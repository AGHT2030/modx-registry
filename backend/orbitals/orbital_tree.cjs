/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * MODX Universe Orbital Tree (BASE)
 * Super-Orb → Sub-Orb → Hybrid
 *
 * This base file loads sovereign orbs only.
 * Additional GALAXIES (MODE, CREATV, AIRS, etc.) are merged in runtime.
 */

const deepMerge = require("./utils/deepMerge");

// -----------------------------------------------------
// BASE ORBITAL TREE (UNCHANGED CORE)
// -----------------------------------------------------
const ORBITAL_TREE = {
    superOrbs: {
        PLAY: { key: "PLAY", label: "Play", orbitLevel: 1, children: ["MODAPLY", "CREATV"] },
        STAY: { key: "STAY", label: "Stay", orbitLevel: 1, children: ["MODASTY", "MODE"] },
        BUILD: { key: "BUILD", label: "Build", orbitLevel: 1, children: ["MODXINVST", "MODRETAIL", "MODENRGY"] },
        GROW: { key: "GROW", label: "Grow", orbitLevel: 1, children: ["MODFARM", "MODWTR", "MODABLU"] },
        LEARN: { key: "LEARN", label: "Learn", orbitLevel: 1, children: [] },
        SHOP: { key: "SHOP", label: "Shop", orbitLevel: 1, children: ["MODRETAIL"] },
        MOVE: { key: "MOVE", label: "Move", orbitLevel: 1, children: ["MODTRVL", "AIRS", "MODARISING"] },
        INVEST: { key: "INVEST", label: "Invest", orbitLevel: 1, children: ["MODXINVST"] },
        PLAN: { key: "PLAN", label: "Plan", orbitLevel: 1, children: ["MODE", "CREATV"] },
        HEAL: { key: "HEAL", label: "Heal", orbitLevel: 1, children: ["MODH"] }
    },

    subOrbs: {
        MODH: { key: "MODH", parent: "HEAL", label: "MOD Health" },
        MODAPLY: { key: "MODAPLY", parent: "PLAY", label: "MOD Play (Gaming)" },
        MODFARM: { key: "MODFARM", parent: "GROW", label: "MOD Farm" },
        MODWTR: { key: "MODWTR", parent: "GROW", label: "MOD Water" },
        MODABLU: { key: "MODABLU", parent: "GROW", label: "MOD ABLU" },
        MODA: { key: "MODA", parent: "STAY", label: "MODA Hotel / Museum" },
        MODENRGY: { key: "MODENRGY", parent: "BUILD", label: "MOD Energy" },
        MODRETAIL: { key: "MODRETAIL", parent: "SHOP", label: "MOD Retail" },
        MODE: { key: "MODE", parent: "PLAN", label: "MODE Event Planning" },
        MODASTY: { key: "MODASTY", parent: "STAY", label: "MODA Stay" },
        MODXINVST: { key: "MODXINVST", parent: "INVEST", label: "MODX Invest" },
        MODTRVL: { key: "MODTRVL", parent: "MOVE", label: "MOD Travel" },
        MODARISING: { key: "MODARISING", parent: "MOVE", label: "MOD A Rising" }
    },

    hybrids: {
        CREATV: {
            key: "CREATV",
            label: "CREATV Hybrid",
            domains: ["PLAY", "PLAN", "BUILD"],
            lanes: ["media", "streaming", "casino-link"],
            shield: "MODX_Shield"
        },
        MODE: {
            key: "MODE",
            label: "MODE Hybrid",
            domains: ["PLAN", "STAY", "PLAY"],
            lanes: ["events", "weddings", "conventions"],
            shield: "MODE_Shield"
        },
        AIRS: {
            key: "AIRS",
            label: "AIRS Hybrid",
            domains: ["MOVE", "HEAL"],
            lanes: ["rideshare", "safe-zone-rescue", "PINMYFIVE"],
            shield: "AIRS_Shield"
        },
        MODASTY: {
            key: "MODASTY",
            label: "MODA Stay Hybrid",
            domains: ["STAY", "MOVE"],
            lanes: ["checkin", "lodging"]
        },
        MODXINVST: {
            key: "MODXINVST",
            label: "MODX Invest Hybrid",
            domains: ["INVEST", "BUILD"],
            lanes: ["etf-builder", "xrpl-bridge"]
        }
    },

    routing: {}
};

// -----------------------------------------------------
// AUTO-MERGE PATCH FILES (MODE, WORMHOLES, LICENSING)
// -----------------------------------------------------

function loadPatch(path) {
    try {
        return require(path);
    } catch (err) {
        console.warn(`⚠ Patch missing: ${path}`);
        return null;
    }
}

const MODE_PATCH = loadPatch("./orbital_tree.MODE_PATCH.cjs");
const WORM_PATCH = loadPatch("./orbital_tree.WORMHOLES_PATCH.cjs");
const LICENSE_PATCH = loadPatch("./orbital_tree.LICENSING_PATCH.cjs");

// MERGE EVERYTHING
let FINAL_TREE = deepMerge(ORBITAL_TREE, MODE_PATCH || {});
FINAL_TREE = deepMerge(FINAL_TREE, WORM_PATCH || {});
FINAL_TREE = deepMerge(FINAL_TREE, LICENSE_PATCH || {});

module.exports = FINAL_TREE;
