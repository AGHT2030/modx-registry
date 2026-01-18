
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

// © 2025 AIMAL Global Holdings | AURA TTS Narration Route
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Save Ari’s voice audio to /public/audio
const audioDir = path.join(__dirname, "../../public/audio");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

router.post("/", async (req, res) => {
    try {
        const { text = "Hello there!", voice = "Ari" } = req.body;
        const fileName = `${voice}_${Date.now()}.mp3`;
        const filePath = path.join(audioDir, fileName);

        const response = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: voice === "Ari" ? "alloy" : "verse",
            input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        res.json({ audioUrl: `/audio/${fileName}` });
    } catch (err) {
        console.error("AURA TTS error:", err);
        res.status(500).json({ error: "TTS generation failed." });
    }
});

module.exports = router;
