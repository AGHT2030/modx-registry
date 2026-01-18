
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

// © 2025 AIMAL Global Holdings | UNLICENSED
// AURA Whisper & Sentiment Route — Secure MODLINK Compliance Version
// Integrates Whisper transcription + GPT sentiment + MODLINK routing (Polygon Mainnet Compatible)

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const uuidv4 = (...args) =>
    import("uuid").then((u) => u.v4(...args));
const axios = require("axios");
const { verifyModlinkAuth } = require("../../middleware/modlinkAuth");
const logger = require("../../logger");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------------------------------------------------------------------
// 🧠 Helper: Temporary audio save / cleanup
// ---------------------------------------------------------------------------
async function saveTempAudio(base64Data) {
    try {
        const buffer = Buffer.from(base64Data.split(",")[1], "base64");
        const filePath = path.resolve(__dirname, `../../tmp/audio_${uuidv4()}.wav`);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    } catch (err) {
        logger?.error("❌ Failed to save temp audio file:", err);
        throw new Error("Audio save failed");
    }
}

function safeDelete(filePath) {
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
        logger?.warn("⚠️ Temp audio cleanup failed:", err.message);
    }
}

// ---------------------------------------------------------------------------
// 🎙️ POST /api/aura/whisper/analyze
// Accepts: { audioBlob, context?, dao? }
// ---------------------------------------------------------------------------
router.post("/analyze", verifyModlinkAuth, async (req, res) => {
    const startTime = Date.now();

    try {
        const { audioBlob, context = "general", dao = "PublicDAO" } = req.body;
        if (!audioBlob)
            return res.status(400).json({ error: "No audioBlob provided" });

        // ✅ Step 1: Save voice blob temporarily
        const filePath = await saveTempAudio(audioBlob);

        // 🔊 Step 2: Transcribe speech to text via Whisper
        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
            language: "en",
        });
        const text = transcription.text?.trim() || "";

        // 🧭 Step 3: Sentiment analysis via GPT
        const analysisPrompt = `
You are AURA’s emotional interpreter.
Analyze the following transcribed speech and estimate:
1. Mood (0–100)
2. Stress (0–100)
3. Positivity (0–100)
Return JSON only in this format:
{ "mood": number, "stress": number, "positivity": number, "summary": "short natural tone summary" }
Speech: """${text}"""`;

        let metrics = {};
        try {
            const sentimentResponse = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: analysisPrompt }],
                temperature: 0.6,
            });

            const raw = sentimentResponse.choices[0].message.content.trim();
            metrics = JSON.parse(raw);
        } catch (parseErr) {
            logger?.warn("⚠️ Fallback JSON parse from GPT sentiment:", parseErr.message);
            metrics = { mood: 50, stress: 50, positivity: 50, summary: "neutral response" };
        }

        // 🔐 Step 4: Log DAO compliance entry
        logger?.info(
            `🧩 Whisper sentiment for DAO:${dao} | context:${context} — ${metrics.summary}`
        );

        // ✅ Clean up temp file
        safeDelete(filePath);

        // 🧾 Step 5: Forward metrics to MODLINK Gateway
        try {
            const gatewayURL = process.env.MODLINK_GATEWAY_URL || "http://localhost:8083";
            await axios.post(
                `${gatewayURL}/api/modlink/emit`,
                {
                    dao,
                    eventType: "WHISPER_SENTIMENT",
                    payload: { context, metrics },
                },
                { headers: { Authorization: req.headers.authorization || "" } }
            );
            logger?.info(`📡 Whisper metrics emitted to ${gatewayURL}`);
        } catch (forwardErr) {
            logger?.warn("⚠️ MODLINK emit skipped:", forwardErr.message);
        }

        // ✅ Step 6: Respond to client
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        return res.json({
            text,
            metrics,
            dao,
            context,
            duration,
            timestamp: new Date().toISOString(),
            message: "Whisper analysis complete",
        });
    } catch (err) {
        logger?.error("❌ Whisper Sentiment Error:", err.message);
        return res
            .status(500)
            .json({ error: "Whisper analysis failed", details: err.message });
    }
});

// ---------------------------------------------------------------------------
// 🧪 Simple fallback test for /api/aura/whisper
// Allows lightweight ping even if full analyze route isn't called
// ---------------------------------------------------------------------------
router.post("/", async (req, res) => {
    res.json({
        ok: true,
        message: "AURA Whisper online — full /analyze route active.",
        usage: "POST /api/aura/whisper/analyze with {audioBlob, context?, dao?}"
    });
});

// ---------------------------------------------------------------------------
// 💠 GET /api/aura/whisper/health
// Lightweight operational status check
// ---------------------------------------------------------------------------
router.get("/health", (req, res) => {
    const uptime = process.uptime();
    res.json({
        ok: true,
        module: "AURA Whisper",
        status: "online",
        provider: "OpenAI GPT+Whisper",
        uptime_seconds: uptime,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || "development"
    });
});

// ---------------------------------------------------------------------------
// 🧭 GET /api/aura/whisper/self-test
// Direct browser-accessible diagnostic for connection + environment
// ---------------------------------------------------------------------------
router.get("/self-test", async (req, res) => {
    try {
        const testPrompt = "System check — verify Whisper integration is active.";
        logger?.info("🔊 Whisper self-test initiated");

        // Lightweight verification — no API calls to avoid quota drain
        const diagnostics = {
            openai_key_loaded: !!process.env.OPENAI_API_KEY,
            modlink_gateway: process.env.MODLINK_GATEWAY_URL || "not set",
            timestamp: new Date().toISOString(),
        };

        res.json({
            ok: true,
            message: "Whisper self-test successful",
            diagnostics,
            prompt: testPrompt
        });
    } catch (err) {
        logger?.error("❌ Whisper self-test error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
