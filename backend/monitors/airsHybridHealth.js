
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

// © 2025 Mia Lopez | AIRS Hybrid Health Monitor
// Monitors AIRS, MODE, CreaTV, and MODA Stay /health endpoints.
// Alerts on state changes via Twilio (if configured) and always logs to console & AIRS change log.

const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 🔔 Optional Twilio (auto-detect)
// Set these in your environment to enable SMS alerts
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_TO
let twilioClient = null;
const TWILIO_ENABLED =
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_FROM &&
    !!process.env.TWILIO_TO;

if (TWILIO_ENABLED) {
    try {
        // Prefer your shared client if it exists
        const sharedClientPath = path.resolve(process.cwd(), "config", "twilioClient.js");
        if (fs.existsSync(sharedClientPath)) {
            twilioClient = require(sharedClientPath);
        } else {
            // Local lightweight client
            const Twilio = require("twilio");
            twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    } catch (e) {
        console.warn("⚠️ Twilio init failed, falling back to console alerts only:", e.message);
        twilioClient = null;
    }
}

// 🧾 Change logger (if present)
let logAIRSChange = () => { };
try {
    ({ logAIRSChange } = require("../utils/airsChangeLogger"));
} catch {
    // no-op if logger not present
}

// ⚙️ Config
const POLL_MS = Number(process.env.AIRS_HEALTH_POLL_MS || 180000); // default 3 minutes
const TIMEOUT_MS = Number(process.env.AIRS_HEALTH_TIMEOUT_MS || 5000);

// You can override any endpoint via ENV (see keys below)
const SERVICES = [
    {
        key: "AIRS",
        url:
            process.env.AIRS_HEALTH_URL ||
            "http://localhost:8083/api/airs/health",
    },
    {
        key: "MODE",
        url:
            process.env.MODE_HEALTH_URL ||
            "http://localhost:8083/api/mode/health",
    },
    {
        key: "CREATV",
        url:
            process.env.CREATV_HEALTH_URL ||
            "http://localhost:8083/api/creatv/health",
    },
    {
        key: "MODA_STAY",
        url:
            process.env.MODA_STAY_HEALTH_URL ||
            "http://localhost:8083/api/moda-stay/health",
    },
];

// 🧠 state to avoid alert spam
const state = new Map(); // key -> { up: boolean, lastChange: ISO, lastMsg: string }

// 🔧 helpers
const nowISO = () => new Date().toISOString();

async function sendAlert(message) {
    // Always log to console
    console.log(`[ALERT ${nowISO()}] ${message}`);
    logAIRSChange(__filename, "alert", message);

    if (twilioClient && TWILIO_ENABLED) {
        try {
            await twilioClient.messages.create({
                to: process.env.TWILIO_TO,
                from: process.env.TWILIO_FROM,
                body: message,
            });
        } catch (e) {
            console.error("❌ Twilio SMS failed:", e.message);
        }
    }
}

function summarizeHealthyPayload(data) {
    if (!data || typeof data !== "object") return "";
    const parts = [];
    if (data.status) parts.push(`status=${data.status}`);
    if (data.module) parts.push(`module=${data.module}`);
    if (data.version) parts.push(`version=${data.version}`);
    if (Array.isArray(data.integrations)) parts.push(`integrations=${data.integrations.join(",")}`);
    return parts.length ? ` (${parts.join(" | ")})` : "";
}

async function checkService(svc) {
    const started = Date.now();
    try {
        const res = await axios.get(svc.url, { timeout: TIMEOUT_MS });
        const healthy =
            res.status === 200 &&
            res.data &&
            (res.data.status === "ok" || res.data.status === "online" || res.data.status === "healthy");

        const payloadSummary = summarizeHealthyPayload(res.data);
        const prev = state.get(svc.key) || { up: undefined, lastChange: null, lastMsg: "" };

        if (healthy) {
            if (prev.up === false || prev.up === undefined) {
                const msg = `✅ ${svc.key} is UP${payloadSummary}`;
                state.set(svc.key, { up: true, lastChange: nowISO(), lastMsg: msg });
                await sendAlert(msg);
            } else {
                // still up; silent
            }
        } else {
            const msg = `🟥 ${svc.key} responded but unhealthy${payloadSummary} | HTTP ${res.status}`;
            if (prev.up !== false) {
                state.set(svc.key, { up: false, lastChange: nowISO(), lastMsg: msg });
                await sendAlert(msg);
            } else {
                // still down; silent
            }
        }
    } catch (err) {
        const prev = state.get(svc.key) || { up: undefined, lastChange: null, lastMsg: "" };
        const took = Date.now() - started;
        const root = err.response
            ? `HTTP ${err.response.status}`
            : err.code || err.message || "unknown error";
        const msg = `🛑 ${svc.key} is DOWN (no /health) — ${root}, timeout=${TIMEOUT_MS}ms, latency=${took}ms, url=${svc.url}`;

        if (prev.up !== false) {
            state.set(svc.key, { up: false, lastChange: nowISO(), lastMsg: msg });
            await sendAlert(msg);
        }
    }
}

async function runOnce() {
    logAIRSChange(__filename, "tick", "Health sweep started");
    await Promise.all(SERVICES.map(checkService));
    logAIRSChange(__filename, "tick", "Health sweep finished");
}

// ▶️ start
(async function main() {
    console.log("🩺 AIRS Hybrid Health Monitor starting…");
    console.log(
        `• Interval: ${POLL_MS}ms | Timeout: ${TIMEOUT_MS}ms | Twilio: ${TWILIO_ENABLED ? "ON" : "OFF"}`
    );
    SERVICES.forEach((s) => console.log(`• ${s.key}: ${s.url}`));
    await runOnce(); // immediate check
    const interval = setInterval(runOnce, POLL_MS);

    // graceful shutdown
    const cleanup = () => {
        console.log("🫡 Health monitor stopping…");
        clearInterval(interval);
        process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
})();
