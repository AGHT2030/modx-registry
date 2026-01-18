/**
 * Boot the Sovereign Orbital Tree
 */

const registry = require("./orbital_tree_registry.cjs");

function bootstrapOrbitalTree() {
    global.MODX_ORBITAL_TREE = registry;

    console.log("🌌 MODX Orbital Tree Loaded");
    console.log("Super-Orbs:", registry.tree.super);
    console.log("Sub-Orbs:", registry.tree.sub);
    console.log("Hybrids:", registry.tree.hybrid);

    return registry;
}

module.exports = { bootstrapOrbitalTree };
