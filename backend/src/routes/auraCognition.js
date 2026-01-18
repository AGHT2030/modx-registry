
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

// © 2025 AIMAL Global Holdings | AURA Cognition Engine Routes
// Integrates DreamState + SoulBond signals to forecast emotional health

const express = require("express");
const router = express.Router();
const AURACognition = require("../models/AURACognition");
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { emitDAOEvent } = require("../../modlink/emitter");

// 🧩 Normalize all inputs to a 0–100 Mood Index
function normalize(value, min = -100, max = 100) {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// 🧠 Analyze sentiment and forecast trends
router.post("/analyze", async (req, res) => {
    try {
        const { userId, text = "", module = "MODH", stressLevel = 0.5 } = req.body;

        // Ask OpenAI for emotion and forecast
        const prompt = `
      Analyze the following text for emotional tone, stress, and confidence:
      "${text}"
      Provide a JSON response with fields: tone, sentimentScore (-100 to 100),
      dominantEmotion, advice (one sentence).
    `;
        const result = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
        });

        const response = JSON.parse(result.choices[0].message.content.trim());
        const moodIndex = normalize(response.sentimentScore);
        const confidenceLevel = 1 - stressLevel;

        const entry = await AURACognition.create({
            userId,
            module,
            tone: response.tone,
            sentimentScore: response.sentimentScore,
            stressLevel,
            confidenceLevel,
            moodIndex,
            dominantEmotion: response.dominantEmotion,
            advisoryNote: response.advice,
        });

        emitDAOEvent("HealthDAO", "COGNITION_UPDATE", {
            userId,
            tone: response.tone,
            moodIndex,
            emotion: response.dominantEmotion,
        });

        res.json({
            status: "ok",
            message: "Cognitive analysis recorded.",
            result: entry,
        });
    } catch (err) {
        console.error("🧠 Cognition Error:", err);
        res.status(500).json({ error: "AURA cognition analysis failed." });
    }
});

// 🪞 Daily summary aggregator (for DreamState reflection)
router.get("/summary/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const records = await AURACognition.find({ userId })
            .sort({ timestamp: -1 })
            .limit(10);

        const avgMood = Math.round(
            records.reduce((a, b) => a + b.moodIndex, 0) / (records.length || 1)
        );
        const avgStress = (
            records.reduce((a, b) => a + b.stressLevel, 0) / (records.length || 1)
        ).toFixed(2);

        const emotions = {};
        records.forEach((r) => {
            emotions[r.dominantEmotion] = (emotions[r.dominantEmotion] || 0) + 1;
        });
        const topEmotion = Object.keys(emotions).reduce(
            (a, b) => (emotions[a] > emotions[b] ? a : b),
            "neutral"
        );

        res.json({
            status: "ok",
            userId,
            summary: {
                avgMood,
                avgStress,
                topEmotion,
                recentEntries: records,
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Cognition summary failed." });
    }
});

module.exports = router;
