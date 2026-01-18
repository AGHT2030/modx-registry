
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

// backend/modlink/registry.js
// © 2025 AIMAL Global Holdings | MODLINK Registry
// Lightweight registry system for gateway route and adapter tracking.

const registry = {
    routes: new Set(),
    adapters: new Set(),

    registerRoute(route) {
        if (!route) return;
        this.routes.add(route);
        console.log(`🔗 MODLINK route registered: ${route}`);
    },

    registerAdapter(adapterName) {
        if (!adapterName) return;
        this.adapters.add(adapterName);
        console.log(`⚙️ MODLINK adapter registered: ${adapterName}`);
    },

    listRoutes() {
        return Array.from(this.routes);
    },

    listAdapters() {
        return Array.from(this.adapters);
    },
};

module.exports = registry;
