
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

// © 2025 AIMAL Global Holdings | AURA Whisper Route
// Transcription + Sentiment Analysis + Emotional Broadcast + MODLINK Emission

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// CJS-safe uuid wrapper
const uuidv4 = (...args) =>
    import("uuid").then((u) => u.v4(...args));

const axios = require("axios");
const chalk = require("chalk");
const OpenAI = require("openai");

// OpenAI client (already initialized in server.js)
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧠 Local transcript log path
const LOG_PATH = path.resolve("./backend/aura/whisper/logs/transcripts.json");

// 🧠 Temporary audio save / cleanup
async function saveTempAudio(base64Data) {
    const buffer = Buffer.from(base64Data.split(",")[1], "base64");
    const filePath = path.resolve(__dirname, `../../tmp/audio_${uuidv4()}.wav`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

function safeDelete(filePath) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function appendTranscript(entry) {
    try {
        fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
        const existing = fs.existsSync(LOG_PATH)
            ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8"))
            : [];
        existing.push(entry);
        fs.writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2));
    } catch (err) {
        console.warn("⚠️ Failed to write Whisper transcript log:", err.message);
    }
}

// 🎙️ POST /api/aura/whisper/analyze
router.post("/analyze", async (req, res) => {
    const startTime = Date.now();

    try {
        const { audioBlob, context = "retail", dao = "PublicDAO" } = req.body;
        if (!audioBlob) return res.status(400).json({ error: "Missing audioBlob" });

        // 1️⃣ Save and transcribe
        const filePath = await saveTempAudio(audioBlob);
        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
            language: "en",
        });
        const text = transcription.text?.trim() || "";

        // 2️⃣ Sentiment Analysis
        const sentimentPrompt = `
Analyze tone and mood for AURA system.
Return JSON: { "mood": number, "stress": number, "positivity": number, "summary": "short phrase", "emotion": "string" }
Speech: """${text}"""`;

        const gpt = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: sentimentPrompt }],
            temperature: 0.6,
        });

        let metrics = {};
        try {
            metrics = JSON.parse(gpt.choices[0].message.content.trim());
        } catch {
            metrics = {
                mood: 50,
                stress: 50,
                positivity: 50,
                emotion: "neutral",
                summary: "neutral response",
            };
        }

        safeDelete(filePath);

        // 3️⃣ Log + Broadcast
        const transcriptEntry = {
            id: uuidv4(),
            text,
            metrics,
            context,
            dao,
            createdAt: new Date().toISOString(),
        };
        appendTranscript(transcriptEntry);

        const io = global.io || null;
        if (io) {
            io.emit("aura:whisper:transcript", transcriptEntry);
            io.emit("aura:emotion:signal", {
                type: "emotionalTone",
                emotion: metrics.emotion || "neutral",
                confidence: (metrics.mood || 50) / 100,
            });
            console.log(chalk.cyanBright("🎧 AURA Whisper → broadcasted emotional tone + transcript."));
        }

        // 4️⃣ Emit to MODLINK Gateway
        const gatewayURL = process.env.MODLINK_GATEWAY_URL || "http://localhost:8083";
        await axios
            .post(`${gatewayURL}/api/modlink/emit`, {
                dao,
                eventType: "WHISPER_SENTIMENT",
                payload: { context, metrics },
            })
            .catch(() => { });

        // 5️⃣ Respond
        res.json({
            text,
            metrics,
            context,
            dao,
            duration: ((Date.now() - startTime) / 1000).toFixed(2),
            message: "Whisper analysis complete",
        });
    } catch (err) {
        console.error("❌ Whisper analysis failed:", err.message);
        res.status(500).json({ error: "Whisper analysis failed", details: err.message });
    }
});

// 🧠 Manual Emotion Sync from Twins or Dashboard
router.post("/emotion", (req, res) => {
    try {
        const { emotion, confidence = 0.8, source = "dashboard" } = req.body || {};
        if (!emotion) return res.status(400).json({ error: "Missing emotion" });

        const signal = {
            emotion,
            confidence,
            source,
            timestamp: new Date().toISOString(),
        };

        if (global.io) {
            global.io.emit("aura:emotion:signal", signal);
            console.log(chalk.magentaBright(`💫 AURA Emotion → ${emotion} (${confidence})`));
        }

        res.json({ ok: true, signal });
    } catch (err) {
        console.error("❌ Emotion sync failed:", err.message);
        res.status(500).json({ error: "Internal emotion sync error" });
    }
});

// 📜 Transcript History
router.get("/history", (req, res) => {
    try {
        if (!fs.existsSync(LOG_PATH)) return res.json([]);
        const data = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Unable to read transcripts" });
    }
});

// 🩺 Health
router.get("/health", (req, res) => {
    res.json({
        ok: true,
        module: "AURA Whisper",
        status: "online",
        provider: "OpenAI Whisper",
        sockets: !!global.io,
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
