/**
 * MODX Shield Binding for Orbital Tree
 */

const registry = require("./orbital_tree_registry.cjs");

module.exports = Object.freeze({
    enforce() {
        const protectedModules = [
            ...registry.tree.super,
            ...registry.tree.sub,
            ...registry.tree.hybrid
        ];

        global.MODX_SHIELD.registerProtectedModules(protectedModules);

        console.log("🛡 MODX Shield: Orbital Tree Protection Enabled");
    }
});
