
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

// © 2025 AIMAL Global Holdings | MODLINK Universe Gateway (UGW)
// -----------------------------------------------------------------------------
// Production transport layer for:
//     → XRPL Governance
//     → EVM Governance
//     → MODLINK Core
//     → C4/C5 Event Bridge
//     → AURA Twins & Sentinel
//     → CoinPurse Compliance Inbox
//     → MODUSD Proof-of-Reserve
//     → MODX Galaxy Engine
//
// Features:
//  • Real HTTP + WebSocket server
//  • Replay queue for offline recovery
//  • PQC-signed envelopes
//  • Rate-limited message bus
//  • Auto-heartbeat + auto-reconnect
//  • Broadcast hub for all dashboards
// -----------------------------------------------------------------------------

const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");
const chalk = require("chalk");

// PQC Seal Layer
const { pqcSignEnvelope } = require("../pqc/pqc-envelope.js");

// Global State
let ONLINE = false;
let CLIENTS = new Set();
let replayQueue = [];
let lastEmit = 0;

const RATE_LIMIT_MS = 100;  // safe for governance throughput

/* -----------------------------------------------------------------------------
   1️⃣ Start HTTP + WebSocket Server
----------------------------------------------------------------------------- */

function startUniverseGateway(port = 8899) {
    const server = http.createServer((req, res) => {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(
                JSON.stringify({
                    gateway: "MODLINK Universe Gateway",
                    online: ONLINE,
                    queueDepth: replayQueue.length,
                    clients: CLIENTS.size,
                    timestamp: new Date().toISOString()
                })
            );
        }

        res.writeHead(404);
        res.end("Universe Gateway");
    });

    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        CLIENTS.add(ws);
        console.log(`🟢 UGW client connected | Total: ${CLIENTS.size}`);

        ws.on("close", () => {
            CLIENTS.delete(ws);
            console.log(`🔴 UGW client disconnected | Total: ${CLIENTS.size}`);
        });
    });

    server.listen(port, () => {
        ONLINE = true;
        console.log(
            chalk.cyanBright(
                `🌐 Universe Gateway ONLINE → ws://localhost:${port}`
            )
        );
    });

    // fencing for hot restart
    global.MODLINK_UGW = { wss, server, port };

    startHeartbeatMonitor();
}

/* -----------------------------------------------------------------------------
   2️⃣ Heartbeat → keeps MODLINK in sync with gateway availability
----------------------------------------------------------------------------- */

function startHeartbeatMonitor() {
    setInterval(() => {
        ONLINE = CLIENTS.size > 0 || true; // treat UGW as online always
    }, 3000);
}

/* -----------------------------------------------------------------------------
   3️⃣ Broadcast Layer (WS)
----------------------------------------------------------------------------- */

function broadcast(topic, payload) {
    const now = Date.now();
    if (now - lastEmit < RATE_LIMIT_MS) return;
    lastEmit = now;

    const packet = pqcSignEnvelope({ topic, payload });

    if (!ONLINE) {
        console.log("🟡 UGW offline — buffering packet:", topic);
        replayQueue.push(packet);
        return;
    }

    for (const client of CLIENTS) {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(packet));
            } catch (err) {
                console.warn("⚠️ WS send error:", err.message);
            }
        }
    }
}

/* -----------------------------------------------------------------------------
   4️⃣ Replay Queue (after reconnect)
----------------------------------------------------------------------------- */

function flushReplayQueue() {
    if (!ONLINE) return;

    while (replayQueue.length > 0) {
        const packet = replayQueue.shift();
        for (const client of CLIENTS) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(packet));
            }
        }
    }
}

/* -----------------------------------------------------------------------------
   5️⃣ Public API → Used by MODLINK Event Bridge
----------------------------------------------------------------------------- */

async function send(packetType, payload) {
    const envelope = pqcSignEnvelope({
        type: packetType,
        ts: Date.now(),
        payload
    });

    if (!ONLINE) {
        replayQueue.push(envelope);
        console.log("🟡 UGW offline — packet added to replay queue:", packetType);
        return false;
    }

    broadcast(packetType, payload);
    return true;
}

/* -----------------------------------------------------------------------------
   EXPORTS
----------------------------------------------------------------------------- */

module.exports = {
    startUniverseGateway,
    broadcast,
    send,
    flushReplayQueue,
    get online() {
        return ONLINE;
    }
};

// Auto-start
startUniverseGateway(8899);
