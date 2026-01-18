
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

// © 2025 AIMAL Global Holdings | Universe Gateway #2 (XRPL Governance Relay)
// Hybrid-signing governance relay for MODLINK, AURA Sentinel, and Policy Advisor.
// Automatically registers as the XRPL Governance Galaxy node (Option 3).
// Includes offline fallback, event caching, PoR-signing, and auto-replay.

const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");
const { initGatewayHAMonitor } = require("./gateway-ha-monitor");

// XRPL Universe Gateway — Heartbeat Emitter
const { updateHeartbeat } = require("../consensus/state-manager");
setInterval(() => updateHeartbeat("XRPL"), 3000);
console.log("🟪 XRPL Universe Gateway heartbeat active (modlink_ha)");

// XRPL client instance (lazy-loaded)
let client = null;

// Load MODLINK router if available
let MODLINK;
try {
    MODLINK = require("../modlink/index");
} catch (err) {
    console.warn("⚠️ MODLINK index not available, falling back to stub:", err.message);
    MODLINK = require("../modlink/stub");
}

// AURA event emitter (Sentinel + Policy Advisor)
const { io } = require("../aura/aura-spectrum");

// Directories
const CACHE_DIR = path.join(process.cwd(), "cache/xrpl-governance");
const QUEUE_DIR = path.join(process.cwd(), "queue/governance");

// Ensure directories exist
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(QUEUE_DIR, { recursive: true });

// Local signing keypair for critical governance messages
const GATEWAY_KEYPAIR = (() => {
    const keyFile = path.join(process.cwd(), "keys/xrpl-gw2.json");
    if (fs.existsSync(keyFile)) {
        return JSON.parse(fs.readFileSync(keyFile));
    }

    const wallet = xrpl.Wallet.generate();
    fs.mkdirSync(path.dirname(keyFile), { recursive: true });
    fs.writeFileSync(keyFile, JSON.stringify(wallet, null, 2));

    console.log("🔑 XRPL Gateway #2 signing key created.");
    return wallet;
})();

// ------------------------------------------------------------
// 🔵 GATEWAY OBJECT
// ------------------------------------------------------------
const XRPLGovernanceGateway = {
    nodeId: GATEWAY_KEYPAIR.classicAddress,
    nodeType: "gateway",
    galaxy: "xrpl-governance",
    capabilities: [
        "por",
        "peg-monitor",
        "trustline-watch",
        "amm-events",
        "nft-governance",
        "supply-change",
    ],
    autoload: true,
    connected: false,
    xrplClient: null,

    async init() {
        console.log("🌐 XRPL Governance Gateway #2: Initializing…");

        // 🌐 Start the HA monitor (Leader/Follower system)
        initGatewayHAMonitor(GATEWAY_KEYPAIR, "XRPL-GW2");

        // Connect to XRPL
        await this.connectXRPL();

        // Register with MODLINK Galaxy Mesh
        this.registerGalaxyNode();

        // Start event listeners
        await this.listenXRPLStreams();

        console.log("🚀 XRPL Governance Gateway #2 fully active.");
    },

    // ------------------------------------------------------------
    // 🔗 CONNECT TO XRPL
    // ------------------------------------------------------------
    async connectXRPL() {
        const endpoint =
            process.env.XRPL_WS_ENDPOINT ||
            "wss://s.altnet.rippletest.net:51233";

        this.xrplClient = new xrpl.Client(endpoint);
        await this.xrplClient.connect();
        this.connected = true;
        console.log(`🔗 Connected to XRPL (${endpoint}).`);
    },

    // ------------------------------------------------------------
    // 🌌 REGISTER WITH MODLINK GALAXY
    // ------------------------------------------------------------
    registerGalaxyNode() {
        if (!MODLINK?.registerGalaxyNode) {
            console.warn("⚠️ MODLINK router unavailable → using fallback stub.");
            return;
        }

        MODLINK.registerGalaxyNode({
            nodeId: this.nodeId,
            nodeType: this.nodeType,
            galaxy: this.galaxy,
            capabilities: this.capabilities,
            autoload: this.autoload,
            timestamp: Date.now(),
        });

        console.log("🌌 Registered as XRPL Governance Galaxy node.");
    },

    // ------------------------------------------------------------
    // 🗃️ OFFLINE FALLBACK LAYER
    // ------------------------------------------------------------
    saveToCache(event) {
        const file = path.join(CACHE_DIR, `${Date.now()}.json`);
        fs.writeFileSync(file, JSON.stringify(event, null, 2));
    },

    queueForReplay(event) {
        const file = path.join(QUEUE_DIR, `${Date.now()}.job`);
        fs.writeFileSync(file, JSON.stringify(event, null, 2));
    },

    async replayQueue() {
        if (!MODLINK?.routerAvailable && !MODLINK?.ingestEvent) return;

        const files = fs.readdirSync(QUEUE_DIR);
        for (const f of files) {
            const fullPath = path.join(QUEUE_DIR, f);
            const data = JSON.parse(fs.readFileSync(fullPath));
            await this.forwardGovernanceEvent(data);
            fs.unlinkSync(fullPath);
        }

        if (files.length > 0) {
            console.log(`♻️ Replayed ${files.length} offline governance events.`);
        }
    },

    // ------------------------------------------------------------
    // 🧾 HYBRID SIGNING
    // ------------------------------------------------------------
    signCriticalEvent(event) {
        const payload = JSON.stringify(event);
        const signature = GATEWAY_KEYPAIR.sign(payload);
        return { ...event, signature, signer: this.nodeId };
    },

    isCritical(type) {
        return [
            "por.attestation",
            "supply.delta",
            "reserve.update",
            "nft.governance",
            "dex.impact",
            "amm.impact",
        ].includes(type);
    },

    // ------------------------------------------------------------
    // 📡 XRPL STREAM LISTENERS
    // ------------------------------------------------------------
    async listenXRPLStreams() {
        if (!this.xrplClient) {
            console.warn("⚠️ XRPL client not initialized, cannot subscribe to streams.");
            return;
        }

        await this.xrplClient.request({
            command: "subscribe",
            streams: ["ledger", "transactions"],
        });

        this.xrplClient.on("transaction", async (tx) => {
            const event = this.transformXRPLEvent(tx);
            if (!event) return;

            const ready = this.prepareGovernanceEvent(event);
            await this.forwardGovernanceEvent(ready);
        });

        console.log("📡 XRPL Governance Gateway #2 listening to XRPL streams.");
    },

    // ------------------------------------------------------------
    // 🔧 TRANSFORM XRPL RAW → MODX GOVERNANCE FORMAT
    // ------------------------------------------------------------
    transformXRPLEvent(tx) {
        if (!tx || !tx.transaction) return null;

        return {
            type: "xrpl.transaction",
            hash: tx.transaction.hash,
            account: tx.transaction.Account,
            meta: tx.meta,
            timestamp: Date.now(),
        };
    },

    // ------------------------------------------------------------
    // 📝 PREPARE + SIGN IF CRITICAL
    // ------------------------------------------------------------
    prepareGovernanceEvent(event) {
        if (this.isCritical(event.type)) {
            return this.signCriticalEvent(event);
        }
        return event;
    },

    // ------------------------------------------------------------
    // 📤 FORWARD TO MODLINK / SENTINEL / POLICY ADVISOR
    // ------------------------------------------------------------
    async forwardGovernanceEvent(event) {
        try {
            // 1 — Send to MODLINK Router
            if (MODLINK?.ingestEvent) {
                MODLINK.ingestEvent(event);
            } else {
                this.queueForReplay(event);
            }

            // 2 — Emit to AURA Sentinel
            io.emit("governance:xrpl-event", event);

            // 3 — Emit to Policy Advisor
            io.emit("policy:advisory:update", {
                source: "xrpl",
                impact: "pending-analysis",
                event,
            });
        } catch (err) {
            console.error("❌ Governance forwarding failed. Saving fallback.", err);
            this.saveToCache(event);
        }
    },
};

// ------------------------------------------------------------
// 🔥 AUTO-INIT WHEN LOADED
// ------------------------------------------------------------
XRPLGovernanceGateway.init().catch((err) => {
    console.error("🚨 Failed to initialize XRPL Governance Gateway #2:", err);
});

module.exports = XRPLGovernanceGateway;
// ------------------------------------------------------------
// 🩺 XRPL GATEWAY HEALTH ENDPOINT (REST)
// ------------------------------------------------------------
const express = require("express");
const healthRouter = express.Router();

// Cache for latest XRPL heartbeat & ledger index
let lastLedgerIndex = null;

// Listen to ledger stream to track latest ledger
if (XRPLGovernanceGateway.xrplClient) {
    XRPLGovernanceGateway.xrplClient.on("ledgerClosed", (ledger) => {
        lastLedgerIndex = ledger.ledger_index;
    });
}

// REST endpoint
healthRouter.get("/gateway/xrpl/health", (req, res) => {
    try {
        return res.json({
            ok: true,
            gateway: "XRPL-Governance",
            nodeId: XRPLGovernanceGateway.nodeId,
            connected: XRPLGovernanceGateway.connected,
            lastLedgerIndex,
            capabilities: XRPLGovernanceGateway.capabilities,
            galaxy: XRPLGovernanceGateway.galaxy,
            timestamp: Date.now(),
        });
    } catch (err) {
        console.error("❌ XRPL Gateway health route error:", err);
        return res.status(500).json({
            ok: false,
            error: "XRPL_GATEWAY_HEALTH_ERROR",
        });
    }
});

// Attach to module for parent router to mount
XRPLGovernanceGateway.healthRouter = healthRouter;
