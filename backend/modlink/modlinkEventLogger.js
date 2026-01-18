
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

// © 2025 AIMAL Global Holdings | MODLINK Event Logger
// Central MongoDB event recorder for all DAO actions.

const mongoose = require("mongoose");
const crypto = require("crypto");
const logger = require("../logger");

const vaultKey = process.env.MODLINK_VAULT_KEY || "fallback-key";
const algorithm = "aes-256-gcm";

// 🔐 Schema
const eventSchema = new mongoose.Schema({
    dao: String,
    type: String,
    payload: String, // encrypted JSON
    timestamp: { type: Date, default: Date.now },
    originIP: String,
    actor: String
});

const ModlinkEvent = mongoose.model("ModlinkEvent", eventSchema);

// 🔒 Encrypt payload
function encryptPayload(data) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(vaultKey.padEnd(32)), iv);
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");
    return JSON.stringify({ iv: iv.toString("base64"), authTag, encrypted });
}

// 🧠 Record event
async function logEvent({ dao, type, payload, actor, ip }) {
    try {
        const record = new ModlinkEvent({
            dao,
            type,
            payload: encryptPayload(payload),
            originIP: ip,
            actor
        });
        await record.save();
        logger.info(`🧾 [${dao}] ${type} logged.`);
    } catch (err) {
        logger.error("Event logging failed:", err);
    }
}

// 🕒 Fetch recent logs
async function getRecentEvents(limit = 50) {
    return await ModlinkEvent.find().sort({ timestamp: -1 }).limit(limit).lean();
}

// 🧮 Range query
async function getEventsByDateRange(start, end) {
    return await ModlinkEvent.find({
        timestamp: { $gte: new Date(start), $lte: new Date(end) }
    }).sort({ timestamp: -1 }).lean();
}

// 🧹 Clear logs (admin-only)
async function clearAllEvents() {
    await ModlinkEvent.deleteMany({});
    logger.warn("🧹 All MODLINK events cleared.");
}

module.exports = { logEvent, getRecentEvents, getEventsByDateRange, clearAllEvents };
