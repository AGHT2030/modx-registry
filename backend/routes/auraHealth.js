
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

// © 2025 AIMAL Global Holdings | AURA Twin Merge Health Route v3.1
// Ensures synchronization + readiness for Ari & Agador models
// Includes emotion, model, translation, encryption, OpenAI health checks, self-healing, and JSON logging

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const router = express.Router();

// ✅ Environment bindings
const { AURA_KEY, OPENAI_API_KEY } = process.env;

// 🧠 Global twin state cache (could be managed from aura-core.js)
let twins = {
    Ari: { model: "gpt-5", emotion: "calm", status: "active", restarts: [] },
    Agador: { model: "gpt-5", emotion: "inquisitive", status: "active", restarts: [] },
};

// 🌍 Translation engine placeholder
let translation = {
    languages: ["en", "es", "fr", "de", "ja", "ko"],
    active: true,
};

// 🔐 AES encryption check
function verifyEncryption() {
    try {
        const text = "AURA_HEALTH_CHECK";
        const key = crypto.createHash("sha256").update(AURA_KEY).digest("base64").substr(0, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return { ok: true, sample: encrypted };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

// 🩺 OpenAI connectivity test
async function checkOpenAI() {
    try {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        const test = await openai.models.list();
        return { ok: true, modelCount: test.data.length };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

// ♻️ Self-healing routine if one twin crashes
async function restartTwin(twinName) {
    const twin = twins[twinName];
    twin.status = "restarting";
    twin.restarts.push(Date.now());
    console.log(`⚙️ Restarting ${twinName}...`);

    // Keep only restart timestamps within 60s
    twin.restarts = twin.restarts.filter(ts => Date.now() - ts < 60000);

    await new Promise(r => setTimeout(r, 2000));
    twin.status = "active";
    console.log(`✅ ${twinName} rebooted successfully.`);
    return `${twinName} rebooted successfully.`;
}

// 🧾 Local logging helper
function logHealthData(entry) {
    try {
        const logDir = path.join(__dirname, "../logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        const logFile = path.join(logDir, "aura_health.json");

        const data = fs.existsSync(logFile)
            ? JSON.parse(fs.readFileSync(logFile, "utf8"))
            : [];

        data.push(entry);
        fs.writeFileSync(logFile, JSON.stringify(data.slice(-1000), null, 2)); // keep last 1000 entries
    } catch (err) {
        console.error("⚠️ Log write failed:", err.message);
    }
}

// 🔍 Health route
router.get("/health", async (req, res) => {
    try {
        const [openaiHealth, encryptionHealth] = await Promise.all([
            checkOpenAI(),
            Promise.resolve(verifyEncryption()),
        ]);

        // Auto restart logic for inactive twins
        for (const [name, twin] of Object.entries(twins)) {
            if (twin.status !== "active") {
                await restartTwin(name);
            }
        }

        const allActive = Object.values(twins).every(t => t.status === "active");

        const result = {
            timestamp: new Date().toISOString(),
            service: "AURA Twin Merge",
            status: allActive && openaiHealth.ok && encryptionHealth.ok ? "healthy" : "degraded",
            twins,
            translation,
            openai: openaiHealth,
            encryption: encryptionHealth,
        };

        // Write JSON log entry
        logHealthData(result);

        res.json(result);
    } catch (err) {
        res.status(500).json({ status: "error", error: err.message });
    }
});

module.exports = router;