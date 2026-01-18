
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

// © 2025 Mia Lopez | Alerting helper (Slack + Email + Console fallback)
const https = require("https");
const nodemailer = require("nodemailer");

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const ALERT_EMAIL_FROM = process.env.ALERT_EMAIL_FROM || SMTP_USER || "alerts@example.com";
const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO || "";

function postToSlack(payload) {
    if (!SLACK_WEBHOOK_URL) return Promise.resolve("slack-disabled");
    return new Promise((resolve, reject) => {
        const url = new URL(SLACK_WEBHOOK_URL);
        const body = Buffer.from(JSON.stringify(payload));
        const req = https.request(
            { method: "POST", hostname: url.hostname, path: url.pathname + url.search, headers: { "Content-Type": "application/json", "Content-Length": body.length } },
            (res) => { res.on("data", () => { }); res.on("end", () => resolve(res.statusCode)); }
        );
        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

async function sendEmail(subject, html) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ALERT_EMAIL_TO) return "email-disabled";
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({ from: ALERT_EMAIL_FROM, to: ALERT_EMAIL_TO, subject, html });
    return "email-sent";
}

/** Normalize status to online/offline/degraded/operational */
function normalizeStatus(s) {
    if (!s) return "unknown";
    const val = String(s).toLowerCase();
    if (["online", "operational"].includes(val)) return "online";
    if (["degraded", "warn", "warning", "partial"].includes(val)) return "degraded";
    if (["offline", "down", "error", "failed"].includes(val)) return "offline";
    return val;
}

/** Core alert */
async function alertHealth({ service, module, status, error, details }) {
    const ns = normalizeStatus(status);
    if (ns === "online") return "ok-noalert";

    const title = `⚠️ Hybrid Health: ${service} is ${ns.toUpperCase()}`;
    const summary = [
        `• Service: ${service}`,
        module ? `• Module: ${module}` : null,
        `• Status: ${ns}`,
        error ? `• Error: ${error}` : null,
        details ? `• Details: ${JSON.stringify(details).slice(0, 600)}` : null,
        `• Time: ${new Date().toISOString()}`
    ].filter(Boolean).join("<br>");

    // Slack
    await postToSlack({
        text: `${title}`,
        blocks: [
            { type: "header", text: { type: "plain_text", text: title } },
            { type: "section", text: { type: "mrkdwn", text: summary.replaceAll("<br>", "\n") } }
        ],
    }).catch(err => console.warn("Slack alert failed:", err.message));

    // Email
    await sendEmail(title, `<h3>${title}</h3><p>${summary}</p>`).catch(err => console.warn("Email alert failed:", err.message));

    // Console (always)
    console.warn(`[ALERT] ${title} ::`, { module, status: ns, error, details });

    return "alert-sent";
}

module.exports = { alertHealth, normalizeStatus };
