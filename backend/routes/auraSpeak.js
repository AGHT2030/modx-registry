
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

// © 2025 AIMAL Global Holdings | AURA Twin Merge — /api/aura/speak
// Accepts audio input, transcribes via Whisper, responds via GPT + TTS

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const crypto = require("crypto");
const router = express.Router();

// ✅ ENVIRONMENT
const { OPENAI_API_KEY } = process.env;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ⚙️ File upload config
const upload = multer({ dest: "uploads/" });

// 🎭 Twin profiles
const twins = {
    Ari: {
        model: "gpt-5",
        voice: "alloy", // OpenAI TTS default
        promptStyle: "friendly, warm, supportive tone.",
    },
    Agador: {
        model: "gpt-5",
        voice: "verse", // alternate OpenAI TTS voice
        promptStyle: "witty, British-accented, inquisitive tone.",
    },
};

// 🔐 Generate random file name
function uniqueFile(prefix, ext) {
    return `${prefix}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
}

// 🧠 POST /api/aura/speak
router.post("/speak", upload.single("audio"), async (req, res) => {
    const twinKey = req.query.twin?.toLowerCase() === "agador" ? "Agador" : "Ari";
    const twin = twins[twinKey];

    try {
        if (!req.file) throw new Error("No audio file uploaded.");

        const audioPath = req.file.path;

        // Step 1️⃣ — Transcribe audio using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1",
        });

        const transcriptText = transcription.text?.trim() || "(No speech detected)";

        // Step 2️⃣ — Generate GPT reply
        const completion = await openai.chat.completions.create({
            model: twin.model,
            messages: [
                {
                    role: "system",
                    content: `You are ${twinKey}, an AI voice assistant with a ${twin.promptStyle}`,
                },
                { role: "user", content: transcriptText },
            ],
        });

        const replyText = completion.choices[0].message.content.trim();

        // Step 3️⃣ — Convert GPT reply to speech
        const ttsFile = uniqueFile(`aura-${twinKey.toLowerCase()}`, "mp3");
        const ttsPath = path.join(__dirname, "../public/audio", ttsFile);

        const ttsResponse = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: twin.voice,
            input: replyText,
        });

        // Save to disk
        const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
        fs.mkdirSync(path.dirname(ttsPath), { recursive: true });
        fs.writeFileSync(ttsPath, audioBuffer);

        // Step 4️⃣ — Clean up temp upload
        fs.unlinkSync(audioPath);

        // ✅ Respond to frontend
        res.json({
            twin: twinKey,
            transcript: transcriptText,
            reply: replyText,
            audioUrl: `/audio/${ttsFile}`,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("AURA /speak error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
