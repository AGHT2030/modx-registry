
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
// Transcription + Sentiment Analysis + MODLINK Emission

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
Return JSON: { "mood": number, "stress": number, "positivity": number, "summary": "short phrase" }
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
            metrics = { mood: 50, stress: 50, positivity: 50, summary: "neutral response" };
        }

        safeDelete(filePath);

        // 3️⃣ Emit to AURA socket + MODLINK
        const { io } = require("../aura-spectrum");
        io.emit("aura:pulse:retail", { metrics, context, dao });

        const gatewayURL = process.env.MODLINK_GATEWAY_URL || "http://localhost:8083";
        await axios.post(`${gatewayURL}/api/modlink/emit`, {
            dao,
            eventType: "WHISPER_SENTIMENT",
            payload: { context, metrics },
        }).catch(() => { });

        // 4️⃣ Respond
        res.json({
            text,
            metrics,
            context,
            dao,
            duration: ((Date.now() - startTime) / 1000).toFixed(2),
            message: "Whisper analysis complete",
        });
    } catch (err) {
        res.status(500).json({ error: "Whisper analysis failed", details: err.message });
    }
});

// 🧪 Health
router.get("/health", (req, res) => {
    res.json({
        ok: true,
        module: "AURA Whisper",
        status: "online",
        provider: "OpenAI Whisper",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
