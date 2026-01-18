
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

/**
 * © 2025 Mia Lopez | AIMAL Global Holdings
 * AURA Voice Route — integrates ElevenLabs TTS + AURA Socket Broadcast
 * Route: POST /api/aura/voice/speak
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { io } = require("./aura-spectrum");

const router = express.Router();

// ⚙️ Config
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ARID = process.env.ELEVENLABS_VOICE_ARID || "EXAVITQu4vr4xnSDxMaL"; // Example: Ari voice
const ELEVENLABS_VOICE_AGADOR = process.env.ELEVENLABS_VOICE_AGADOR || "21m00Tcm4TlvDq8ikWAM"; // Example: Agador voice
const TMP_DIR = path.resolve(__dirname, "../../tmp");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// 🎤 POST /api/aura/voice/speak
router.post("/speak", async (req, res) => {
    try {
        const { twin = "Ari", message = "", style = "soft" } = req.body;

        if (!message) return res.status(400).json({ error: "Message text required" });
        if (!ELEVENLABS_API_KEY) return res.status(500).json({ error: "Missing ElevenLabs API key" });

        const voiceId = twin === "Agador" ? ELEVENLABS_VOICE_AGADOR : ELEVENLABS_VOICE_ARID;

        // 🧠 Build voice request payload
        const voicePayload = {
            text: message,
            model_id: "eleven_turbo_v2",
            voice_settings: {
                stability: twin === "Ari" ? 0.7 : 0.4,
                similarity_boost: 0.8,
                style: style === "strategic" ? 0.6 : 0.3,
            },
        };

        // 🔊 ElevenLabs API call
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            voicePayload,
            {
                headers: {
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            }
        );

        // 💾 Save audio to temporary file
        const fileId = uuidv4();
        const filePath = path.join(TMP_DIR, `${fileId}.mp3`);
        fs.writeFileSync(filePath, Buffer.from(response.data), "binary");

        // 📡 Emit playback event to AURA sockets
        io.emit("aura:voice:play", {
            twin,
            fileId,
            message,
            url: `/tmp/${fileId}.mp3`,
            timestamp: new Date().toISOString(),
        });

        console.log(`🎧 ${twin} spoke: "${message}"`);
        res.json({
            ok: true,
            twin,
            message,
            file: `/tmp/${fileId}.mp3`,
            info: "Voice synthesis complete and emitted.",
        });

        // ⏳ Optional cleanup after 2 minutes
        setTimeout(() => {
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.warn("⚠️ Voice temp cleanup failed:", err.message);
            }
        }, 120000);
    } catch (err) {
        console.error("❌ Voice synthesis failed:", err.message);
        res.status(500).json({ error: "Voice synthesis failed", details: err.message });
    }
});

// 🧪 Health route
router.get("/health", (req, res) => {
    res.json({
        ok: true,
        module: "AURA Voice Route",
        provider: "ElevenLabs",
        status: ELEVENLABS_API_KEY ? "ready" : "missing API key",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
