
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

// © 2025 Mia Lopez | AURA TTS Bridge
// 🔊 Fallback Text-to-Speech integration (used by Agador & Ari across AIRS / CoinPurse / MODA)

const express = require("express");
const path = require("path");
const router = express.Router();

// Core TTS fallback logic (retained from your existing file)
const ttsCore = {
    speak: async (text = "AURA system online.") => {
        console.log(`🗣️  [AURA:TTS] ${text}`);
        return {
            success: true,
            message: text,
            audioPath: path.resolve(__dirname, "tts-placeholder.mp3"),
        };
    },
    health: () => ({
        module: "AURA TTS",
        status: "online",
        provider: "local-fallback",
        timestamp: new Date().toISOString(),
    }),
};

// REST endpoint for direct access from the frontend or other modules
router.post("/", async (req, res) => {
    try {
        const { text } = req.body || {};
        const result = await ttsCore.speak(text);
        res.json({ ok: true, ...result });
    } catch (err) {
        console.error("❌ AURA TTS error:", err);
        res.status(500).json({ ok: false, error: "TTS failed" });
    }
});

router.get("/health", (req, res) => {
    res.json({ ok: true, ...ttsCore.health() });
});

// Export both router (for Express) and core (for internal use)
router.speak = ttsCore.speak;
router.health = ttsCore.health;
module.exports = router;