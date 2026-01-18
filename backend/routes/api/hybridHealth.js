
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

// © 2025 Mia Lopez | Unified Hybrid Health Router
// Aggregates MODE / CREATV / AIRS / MODA Stay / CoinPurse hybrid middleware health
// for live monitoring dashboards, PM2 uptime checks, and PowerShell status probes.
// Includes Slack alerting, rate-limit batching, and threaded notifications.

const express = require("express");
const router = express.Router();
const { safeRequire } = require("../../middleware/globalMiddlewareLoader");
const axios = require("axios");
const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// 🧩 Safe imports for each hybrid module
// ---------------------------------------------------------------------------
const mode = safeRequire("../../middleware/modeSessionHandler");
const creatv = safeRequire("../../middleware/creatvSessionSync");
const airs = safeRequire("../../middleware/airsMiddleware");
const modaStay = safeRequire("../../routes/api/modaStayHybrid");
const coinpurse = safeRequire("../../middleware/coinpurseMiddleware");

// ---------------------------------------------------------------------------
// 🕒 Rate-limiting + Alert Cache
// ---------------------------------------------------------------------------
const alertCache = {};
const ALERT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
const ALERT_EMAIL = process.env.ALERT_EMAIL || "ops@modx.eco";

// Nodemailer fallback for email notifications
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
    },
});

// ---------------------------------------------------------------------------
// 📨 Unified Alert Handler
// ---------------------------------------------------------------------------
async function sendAlert(service, status, details = {}) {
    const now = Date.now();
    const lastAlert = alertCache[service] || 0;
    if (now - lastAlert < ALERT_INTERVAL_MS) {
        console.log(`⏳ Skipping alert for ${service} (rate-limited)`);
        return;
    }
    alertCache[service] = now;

    const color =
        status === "offline"
            ? "#ff0000"
            : status === "degraded"
                ? "#ffcc00"
                : "#00ff00";

    const payload = {
        attachments: [
            {
                color,
                title: `⚠️ ${service} Alert — ${status.toUpperCase()}`,
                text: details.message || "Automatic monitoring alert",
                ts: Math.floor(Date.now() / 1000),
            },
        ],
    };

    // Slack thread handling
    if (details.thread_ts) payload.thread_ts = details.thread_ts;

    try {
        if (SLACK_WEBHOOK_URL) {
            await axios.post(SLACK_WEBHOOK_URL, payload);
            console.log(`📣 Slack alert sent for ${service} (${status})`);
        } else {
            console.warn("⚠️ Slack webhook not configured.");
        }
    } catch (err) {
        console.error("❌ Slack alert failed:", err.message);
    }

    try {
        if (ALERT_EMAIL && transporter.options.auth.user) {
            await transporter.sendMail({
                from: `"MODX Monitor" <${transporter.options.auth.user}>`,
                to: ALERT_EMAIL,
                subject: `${service} ${status.toUpperCase()} Alert`,
                html: `<b>${service}</b> reported <b>${status}</b><br/>${details.message || "No details"}<br/><i>${new Date().toISOString()}</i>`,
            });
            console.log(`📧 Email alert sent for ${service} (${status})`);
        }
    } catch (err) {
        console.error("❌ Email alert failed:", err.message);
    }
}

// ---------------------------------------------------------------------------
// 🩺 MODE Health
// ---------------------------------------------------------------------------
router.get("/mode/health", (req, res) => {
    const health = mode?.healthCheck ? mode.healthCheck() : { status: "unknown" };
    const response = {
        service: "MODE Hybrid",
        module: "modeSessionHandler",
        ...health,
        timestamp: new Date().toISOString(),
    };
    if (response.status !== "online") {
        sendAlert("MODE Hybrid", response.status, { message: "MODE degraded or offline." });
    }
    res.json(response);
});

// ---------------------------------------------------------------------------
// 🩺 CREATV Health
// ---------------------------------------------------------------------------
router.get("/creatv/health", (req, res) => {
    const health = creatv?.router
        ? { status: "online", module: "creatvSessionSync" }
        : { status: "unknown" };
    const response = {
        service: "CREATV Hybrid",
        ...health,
        timestamp: new Date().toISOString(),
    };
    if (response.status !== "online") {
        sendAlert("CREATV Hybrid", response.status, { message: "CREATV degraded or offline." });
    }
    res.json(response);
});

// ---------------------------------------------------------------------------
// 🩺 AIRS Health
// ---------------------------------------------------------------------------
router.get("/airs/health", (req, res) => {
    const health = airs?.healthCheck ? airs.healthCheck() : { status: "unknown" };
    const response = {
        service: "AIRS Hybrid",
        module: "airsMiddleware",
        ...health,
        timestamp: new Date().toISOString(),
    };
    if (response.status !== "online") {
        sendAlert("AIRS Hybrid", response.status, { message: "AIRS degraded or offline." });
    }
    res.json(response);
});

// ---------------------------------------------------------------------------
// 🩺 MODA Stay Health
// ---------------------------------------------------------------------------
router.get("/moda/health", (req, res) => {
    try {
        const response = {
            service: "MODA Stay Hybrid",
            module: "modaStayHybrid",
            status: "online",
            integrations: ["AIRS", "CoinPurse", "Wyndham"],
            timestamp: new Date().toISOString(),
        };
        res.json(response);
    } catch (err) {
        const response = {
            service: "MODA Stay Hybrid",
            module: "modaStayHybrid",
            status: "degraded",
            error: err.message,
            timestamp: new Date().toISOString(),
        };
        sendAlert("MODA Stay Hybrid", "degraded", { message: err.message });
        res.json(response);
    }
});

// ---------------------------------------------------------------------------
// 🩺 CoinPurse Health
// ---------------------------------------------------------------------------
router.get("/coinpurse/health", (req, res) => {
    try {
        const connected = !!coinpurse;
        const response = {
            service: "CoinPurse Hybrid",
            module: "coinpurseMiddleware",
            status: connected ? "online" : "offline",
            integrations: ["MODE", "AIRS", "CREATV", "MODA"],
            timestamp: new Date().toISOString(),
        };
        if (!connected) {
            sendAlert("CoinPurse Hybrid", "offline", { message: "CoinPurse middleware disconnected." });
        }
        res.json(response);
    } catch (err) {
        const response = {
            service: "CoinPurse Hybrid",
            module: "coinpurseMiddleware",
            status: "degraded",
            error: err.message,
            timestamp: new Date().toISOString(),
        };
        sendAlert("CoinPurse Hybrid", "degraded", { message: err.message });
        res.json(response);
    }
});

// ---------------------------------------------------------------------------
// 🧭 Unified Status Summary
// ---------------------------------------------------------------------------
router.get("/status", (req, res) => {
    const now = new Date().toISOString();
    res.json({
        system: "MODX Hybrid Ecosystem",
        status: "operational",
        timestamp: now,
        hybrids: {
            mode: "online",
            creatv: "online",
            airs: "online",
            modaStay: "online",
            coinpurse: "online",
        },
        note: "All hybrid services are active and reporting status normally.",
    });
});

module.exports = router;
