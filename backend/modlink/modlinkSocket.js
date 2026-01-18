
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

// © 2025 AIMAL Global Holdings | MODLINK WebSocket Hub
// Real-time event gateway for DAO-compliant updates

const WebSocket = require("ws");
const crypto = require("crypto");
const logger = require("../../logger");
const { registry } = require("./registry");

const secretKey = process.env.MODLINK_HMAC_SECRET || "dev-secret";

/**
 * Initialize WebSocket server and attach to existing HTTP server
 * @param {import('http').Server} server
 */
function initMODLINKSocket(server) {
    const wss = new WebSocket.Server({ server, path: "/ws/modlink" });
    logger?.info("🌐 MODLINK WebSocket hub initialized.");

    wss.on("connection", (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");
        const dao = url.searchParams.get("dao") || "PublicDAO";

        if (!token) {
            ws.close(4001, "Unauthorized — missing token");
            return;
        }

        ws.dao = dao;
        ws.isAlive = true;

        ws.on("pong", () => (ws.isAlive = true));
        ws.send(JSON.stringify({ status: "connected", dao }));

        logger?.info(`🔗 WebSocket connected for DAO: ${dao}`);
    });

    // Heartbeat for connection integrity
    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    /**
     * Emit event to DAO subscribers
     * @param {string} dao
     * @param {string} eventType
     * @param {object} payload
     */
    function broadcast(dao, eventType, payload) {
        const body = JSON.stringify(payload);
        const signature = crypto.createHmac("sha256", secretKey).update(body).digest("hex");
        const message = JSON.stringify({ dao, eventType, payload, signature });

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.dao === dao) {
                client.send(message);
            }
        });
        logger?.info(`📡 Broadcasted ${eventType} to ${dao}`);
    }

    return { wss, broadcast };
}

module.exports = { initMODLINKSocket };
