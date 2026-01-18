
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

// © 2025 AIMAL Global Holdings | Gateway High-Availability (G-HA) Monitor
// Provides heartbeat emission, failover detection, and auto-role switching
// for Universe Gateway #1 and #2. Designed for MODLINK Mesh Governance (Option 3).

const fs = require("fs");
const path = require("path");
const { io } = require("../aura/aura-spectrum");

let MODLINK;
try {
    MODLINK = require("../modlink/index");
} catch (e) {
    MODLINK = require("../modlink/stub");
}

// Where gateway state is stored
const STATE_FILE = path.join(process.cwd(), "runtime/gateway_ha_state.json");
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

// Default HA state
const defaultState = {
    gatewayId: null,       // XRPL address of THIS gateway
    role: "follower",      // leader | follower
    lastPrimaryHeartbeat: 0,
    takeoverActive: false,
    lastHeartbeatSent: 0
};

// Load state or initialize
function loadState() {
    try {
        return JSON.parse(fs.readFileSync(STATE_FILE));
    } catch (e) {
        return defaultState;
    }
}

// Save state
function saveState(s) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// ------------------------------------------------------------
// HEARTBEAT GENERATOR
// ------------------------------------------------------------
async function sendHeartbeat(GATEWAY_KEYPAIR, gatewayName) {
    const state = loadState();

    const heartbeat = {
        gateway: gatewayName,
        gatewayId: GATEWAY_KEYPAIR.classicAddress,
        role: state.role,
        timestamp: Date.now()
    };

    // Sign heartbeat
    const payload = JSON.stringify(heartbeat);
    heartbeat.signature = GATEWAY_KEYPAIR.sign(payload);

    // Send into MODLINK Router (if alive)
    if (MODLINK?.ingestEvent) {
        MODLINK.ingestEvent({
            type: "gateway.heartbeat",
            ...heartbeat
        });
    }

    // Emit to AURA Sentinel
    io.emit("governance:heartbeat", heartbeat);

    // Update last sent
    state.lastHeartbeatSent = Date.now();
    saveState(state);
}

// ------------------------------------------------------------
// FAILOVER DETECTION
// ------------------------------------------------------------
function checkFailover() {
    const state = loadState();
    const now = Date.now();

    const timeSincePrimary = now - state.lastPrimaryHeartbeat;

    // If primary heartbeat missing for > 12 seconds → TAKEOVER
    if (timeSincePrimary > 12000 && state.role !== "leader") {
        console.log("⚠️ Primary gateway heartbeat lost → INITIATING FAILOVER.");

        state.role = "leader";
        state.takeoverActive = true;
        saveState(state);

        // Notify Sentinel + Policy Advisor
        io.emit("policy:advisory:update", {
            source: "gateway-ha",
            event: "failover-activated",
            leader: state.gatewayId,
            timestamp: now
        });
    }
}

// ------------------------------------------------------------
// FOLLOW MODE → LISTEN FOR PRIMARY HEARTBEATS
// ------------------------------------------------------------
function registerPrimaryHeartbeat(heartbeat) {
    const state = loadState();

    state.lastPrimaryHeartbeat = heartbeat.timestamp;

    // If previously in takeover, revert
    if (state.takeoverActive && state.role === "leader" && heartbeat.gateway !== state.gatewayId) {
        console.log("💠 Primary gateway recovered → Returning to follower mode.");

        state.role = "follower";
        state.takeoverActive = false;

        io.emit("policy:advisory:update", {
            source: "gateway-ha",
            event: "primary-restored",
            primary: heartbeat.gateway,
            timestamp: Date.now()
        });
    }

    saveState(state);
}

// ------------------------------------------------------------
// INIT HA MONITOR
// ------------------------------------------------------------
function initGatewayHAMonitor(GATEWAY_KEYPAIR, gatewayName) {
    console.log("🛰️ Gateway High-Availability Monitor: ACTIVE");

    const state = loadState();
    state.gatewayId = GATEWAY_KEYPAIR.classicAddress;
    saveState(state);

    // Listen to all heartbeats from other gateways
    io.on("governance:heartbeat", (hb) => {
        if (hb.gatewayId !== state.gatewayId) {
            registerPrimaryHeartbeat(hb);
        }
    });

    // Send heartbeat every 5 seconds
    setInterval(() => {
        sendHeartbeat(GATEWAY_KEYPAIR, gatewayName);
        checkFailover();
    }, 5000);
}

module.exports = {
    initGatewayHAMonitor
};
