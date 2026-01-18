/**
 * Bind Orbital Tree to MODLINK Governance Spine
 */

const registry = require("./orbital_tree_registry.cjs");

module.exports = Object.freeze({
    bind(modlink) {
        modlink.registerOrbitalTree(registry);

        console.log("🔗 MODLINK: Orbital Governance Bound → Sovereign Tree");
        return true;
    }
});
