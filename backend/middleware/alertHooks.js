
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

// © 2025 Mia Lopez | MODX Unified Alert Hooks
// 🔔 Centralized Slack & Email alerting with rate-limiting for hybrid modules.

const nodemailer = require("nodemailer");
const axios = require("axios");

let lastAlerts = {}; // serviceName -> timestamp
const cooldownMs = 120000; // 2 min cooldown between alerts

/**
 * 🔔 Send alert (Slack + Email)
 * @param {string} service - The hybrid service name
 * @param {string} message - Description of the issue
 */
async function sendAlert(service, message) {
    const now = Date.now();
    const lastTime = lastAlerts[service] || 0;
    if (now - lastTime < cooldownMs) {
        console.log(`🕒 Skipping duplicate alert for ${service}`);
        return;
    }
    lastAlerts[service] = now;

    const timestamp = new Date().toISOString();
    const text = `🚨 *${service} Alert* — ${message}\n🕒 ${timestamp}`;

    // 🧭 Slack webhook (optional)
    if (process.env.SLACK_ALERT_WEBHOOK) {
        try {
            await axios.post(process.env.SLACK_ALERT_WEBHOOK, { text });
            console.log(`✅ Slack alert sent for ${service}`);
        } catch (err) {
            console.warn(`⚠️ Slack alert failed for ${service}: ${err.message}`);
        }
    }

    // ✉️ Nodemailer (optional)
    if (process.env.ALERT_EMAIL && process.env.SMTP_HOST) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.ALERT_EMAIL,
                subject: `🚨 ${service} Alert`,
                text: `${message}\nTimestamp: ${timestamp}`,
            });
            console.log(`✅ Email alert sent for ${service}`);
        } catch (err) {
            console.warn(`⚠️ Email alert failed for ${service}: ${err.message}`);
        }
    }
}

/**
 * 🧠 Monitor helper — sends alert only if degraded
 */
function checkHealthAndAlert(service, isHealthy, reason) {
    if (!isHealthy) {
        sendAlert(service, reason || "Service degraded or missing dependencies.");
    }
}

module.exports = { sendAlert, checkHealthAndAlert };
