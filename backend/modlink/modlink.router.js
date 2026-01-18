
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

/**
 * © 2025 Mia Lopez | AIMAL Global Holdings
 * MODLINK Governance Router — Unified DAO Registry & AURA Bridge
 */

const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { io } = require("../aura/aura-spectrum");
const { auraPolicyEmitter } = require("../aura/policy/auraPolicyLoader");

class ModlinkRouter extends EventEmitter {
    constructor() {
        super();
        this.registryPath = path.resolve("backend/modlink/modlinkRegistry.json");
        this.registry = this.loadRegistry();
        this.watchRegistry();
    }

    loadRegistry() {
        try {
            const data = fs.readFileSync(this.registryPath, "utf8");
            const parsed = JSON.parse(data);
            console.log("✅ [MODLINK] Registry loaded with", parsed.registry.orbs.length, "orbs.");
            return parsed;
        } catch (err) {
            console.error("❌ [MODLINK] Failed to load registry:", err.message);
            return { registry: { hybrids: [], orbs: [] } };
        }
    }

    resolveHybrids(orb) {
        const links = Object.entries(this.registry.router)
            .filter(([_, orbs]) => orbs.includes(orb))
            .map(([hybrid]) => hybrid);
        console.log(`🛰️ [MODLINK] Orb '${orb}' routes to hybrids: ${links.join(", ")}`);
        return links;
    }

    getTwinLead(orb) {
        for (const [twin, orbs] of Object.entries(this.registry.governance.leads)) {
            if (orbs.includes(orb)) return twin;
        }
        return "Unassigned";
    }

    routeIntent(userIntent) {
        const orb = userIntent.toUpperCase();
        const hybrids = this.resolveHybrids(orb);
        const twin = this.getTwinLead(orb);

        const payload = {
            orb,
            hybrids,
            twin,
            timestamp: new Date().toISOString()
        };

        console.log(`🔁 [MODLINK] Routing intent '${orb}' via ${twin}.`);
        io.emit("modlink:dao:update", payload);
        this.emit("orb:routed", payload);
        return payload;
    }

    watchRegistry() {
        fs.watchFile(this.registryPath, { interval: 4000 }, () => {
            console.log("♻️ [MODLINK] Registry change detected — reloading...");
            this.registry = this.loadRegistry();
            io.emit("modlink:registry:update", this.registry);
        });
    }
}

// 🔗 Initialize MODLINK Router
const modlinkRouter = new ModlinkRouter();

// 🔒 Listen for AURA Policy Updates
auraPolicyEmitter.on("policy:update", (policy) => {
    console.log("📜 [MODLINK] Received new AURA policy broadcast.");
    io.emit("modlink:policy:audit", policy);
});

// 🧠 Example: Dynamic intent routing (to be called from Twins or Dashboard)
function handleUserIntent(intent) {
    return modlinkRouter.routeIntent(intent);
}

module.exports = { modlinkRouter, handleUserIntent };
