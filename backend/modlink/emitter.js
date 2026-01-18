
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

// © 2025 AIMAL Global Holdings | MODLINK EventEmitter Layer
// Centralized event broadcaster for all DAO-compliant actions
// Includes signed WebSocket broadcast, queue buffering, and multi-DAO awareness.

const logger = require("../../logger");
const { initMODLINKSocket } = require("./modlinkSocket");
const crypto = require("crypto");
const EventLog = require("../models/EventLog");

let socketHub = null;
const secretKey = process.env.MODLINK_HMAC_SECRET || "dev-secret";

// Simple queue for safety if socketHub isn’t ready yet
let pendingEvents = [];

/* --------------------------------------------------
   🔹 Initialize the event emitter with existing HTTP server
-------------------------------------------------- */
function initEmitter(server) {
    try {
        socketHub = initMODLINKSocket(server);
        logger.info("🚀 MODLINK Emitter Layer initialized.");

        // Flush pending events if any queued before sockets were ready
        if (pendingEvents.length > 0) {
            logger.info(`🧾 Flushing ${pendingEvents.length} queued MODLINK events...`);
            const queued = [...pendingEvents];
            pendingEvents = [];
            queued.forEach((e) => emitDAOEvent(e.dao, e.eventType, e.payload));
        }

        return socketHub;
    } catch (err) {
        logger.error("❌ Failed to initialize MODLINK Emitter:", err);
    }
}

/* --------------------------------------------------
   🔹 Emit an event to all clients under a specific DAO
-------------------------------------------------- */
function emitDAOEvent(dao, eventType, payload) {
    if (!socketHub) {
        pendingEvents.push({ dao, eventType, payload });
        logger.warn(`⚠️ MODLINK Emitter not initialized yet — queued ${eventType}`);
        return;
    }

    try {
        // Add secure HMAC signature
        const body = JSON.stringify(payload || {});
        const signature = crypto
            .createHmac("sha256", secretKey)
            .update(body)
            .digest("hex");

        const signedPayload = {
            dao,
            eventType,
            payload,
            signature,
            timestamp: new Date().toISOString(),
        };

        // Broadcast event through MODLINK socket layer
        if (socketHub && typeof socketHub.broadcast === "function") {
            socketHub.broadcast(dao, eventType, signedPayload);
        } else if (socketHub && socketHub.emit) {
            // fallback: regular emit
            socketHub.emit(eventType, signedPayload);
        }

        logger.info(`📡 ${dao} emitted ${eventType}`);

        // Log event to MongoDB for audit trail
        EventLog.create({
            dao,
            eventType,
            payload,
            signature,
            createdAt: new Date().toISOString(),
        }).catch((err) =>
            logger.error("❌ Failed to log MODLINK event:", err.message)
        );
    } catch (err) {
        logger.error("❌ MODLINK Emit Error:", err);
    }
}

/* --------------------------------------------------
   🔹 Cross-DAO relay (e.g., Finance triggers Health analytics)
-------------------------------------------------- */
function emitMultiDAO(daos, eventType, payload) {
    if (!Array.isArray(daos)) return;
    daos.forEach((dao) => emitDAOEvent(dao, eventType, payload));
}

/* --------------------------------------------------
   🔹 Domain-Specific Emitters (Convenience API)
-------------------------------------------------- */
const MODLINKEmitter = {
    // 💰 Financial + Investment events
    finance: (type, data) => emitDAOEvent("FinanceDAO", type, data),
    invest: (type, data) => emitDAOEvent("InvestDAO", type, data),

    // 🧠 Health, DreamState, Cognitive Reflection
    health: (type, data) => emitDAOEvent("HealthDAO", type, data),

    // 🎟️ Events + Entertainment
    events: (type, data) => emitDAOEvent("EventsDAO", type, data),
    entertainment: (type, data) => emitDAOEvent("EntertainmentDAO", type, data),

    // 🏨 Hospitality + Museum
    hospitality: (type, data) => emitDAOEvent("HospitalityDAO", type, data),

    // 🗳️ Governance (DAO votes, MODLINK policy sync)
    governance: (type, data) => emitDAOEvent("GovernanceDAO", type, data),

    // 🌍 Broadcast system-wide (AURA twin updates, policy alerts)
    broadcast: (type, data) =>
        emitMultiDAO(
            [
                "FinanceDAO",
                "InvestDAO",
                "HealthDAO",
                "EventsDAO",
                "EntertainmentDAO",
                "HospitalityDAO",
                "GovernanceDAO",
            ],
            type,
            data
        ),
};

/* --------------------------------------------------
   🔹 Exports
-------------------------------------------------- */
module.exports = {
    initEmitter,
    emitDAOEvent,
    emitMultiDAO,
    MODLINKEmitter,
};
