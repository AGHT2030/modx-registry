
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

// backend/services/twilioService.js
const twilio = require("twilio");
const { TWILIO_SID, TWILIO_AUTH, TWILIO_FROM } = process.env;

const client = twilio(TWILIO_SID, TWILIO_AUTH);

async function sendSOSAlert({ name, location, phone, message }) {
    return client.messages.create({
        body: `🚨 SOS ALERT from ${name}\nLocation: ${location}\nMessage: ${message}`,
        from: TWILIO_FROM,
        to: phone
    });
}

module.exports = { sendSOSAlert };
