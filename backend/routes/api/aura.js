
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

// backend/routes/api/aura.js
// © 2025 AIMAL Global Holdings | CoinPurse™ AURA Voice Gateway (Soul-Bound Twins Integration)
// Routes connecting Ari & Agador’s emotional intelligence to the CoinPurse/AIRS/MODA ecosystem.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const upload = multer();

const auraVoice = require("../../src/modules/auraVoice");

// --------------------------------------------------
// 🩺 HEALTH CHECK — confirm AURA backend availability
// --------------------------------------------------
router.get("/health", (req, res) => {
    res.json({
        status: auraVoice.available ? "ok" : "fallback",
        service: "AURA Soul-Bound Voice Gateway",
        twins: ["Ari", "Agador"],
        available: auraVoice.available,
        timestamp: new Date().toISOString(),
    });
});
// AURA Voice + Vision API
// Hybrid translation and description route for Ari & Agador

const AURA = require("../../src/modules/auraVoice");
const Tesseract = require("tesseract.js");

// 🧠 TEXT TRANSLATION — "Hey Ari, translate this"
router.post("/translate", async (req, res) => {
    try {
        const { text, targetLang = "en", voice = "ari", emotion = "calm" } = req.body;
        const result = await AURA.translate(text, targetLang);

        // Optionally generate a spoken translation
        const speech = await AURA.synthesize(result.translated, voice, emotion);

        res.json({
            success: true,
            detectedLanguage: result.detectedLang,
            translatedText: result.translated,
            audioUrl: speech.audioUrl,
        });
    } catch (err) {
        console.error("❌ Translation error:", err);
        res.status(500).json({ success: false, message: "Translation failed." });
    }
});

//LANGUAGE PERSONALITY PREFERENCES
const { detectLanguage, translateText, setLanguagePref, getLanguagePref } = require("../../src/modules/auraLanguage");

// 🌍 Detect & Save Preferred Language
router.post("/language/set", async (req, res) => {
    try {
        const { userName, sampleText } = req.body;
        const lang = await detectLanguage(sampleText);
        setLanguagePref(userName, lang);
        res.json({ success: true, preferredLanguage: lang });
    } catch (err) {
        res.status(500).json({ success: false, message: "Language detection failed." });
    }
});

// 🌐 Translate Text on Demand
router.post("/language/translate", async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const translated = await translateText(text, targetLang);
        res.json({ success: true, translated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Translation failed." });
    }
});
// API BAKEND ROUTE: AURA PERSONALITY & TRANSLATION PREFERENCES
// © 2025 Mia Lopez | AURA Backend Routes — Agador & Ari Twins
// Handles: Translation, Voice Commands, Synthesis, NFT summaries

const OpenAI = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

const log = (...args) => console.log("[AURA API]", ...args);

/* --------------------------------------------------
   🔹 /api/aura/admin/logs — Admin metrics & history
-------------------------------------------------- */
router.get("/admin/logs", async (req, res) => {
    try {
        const logFile = path.resolve(__dirname, "../../../logs/aura-activity.json");
        if (!fs.existsSync(logFile)) {
            return res.json({ logs: [], summary: {} });
        }

        const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
        const summary = {
            totalRequests: logs.length,
            ari: logs.filter((x) => x.voice === "ari").length,
            agador: logs.filter((x) => x.voice === "agador").length,
            translations: logs.filter((x) => x.action === "translate").length,
            synths: logs.filter((x) => x.action === "synthesize").length,
        };

        res.json({ logs, summary });
    } catch (err) {
        console.error("❌ AURA Admin Log Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch logs." });
    }
});

/* --------------------------------------------------
   🔹 /api/aura/greet — Personalized greeting
-------------------------------------------------- */
router.post("/greet", async (req, res) => {
    try {
        const { userName = "Guest", context = "general", voice = "ari" } = req.body;

        const prompt = `You are ${voice === "agador" ? "Agador" : "Ari"}, the AI twin of the AURA system. 
    Greet ${userName} warmly as they enter the ${context}. 
    Your tone should reflect your distinct personality.`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
        });

        res.json({ greeting: response.choices?.[0]?.message?.content || "Hello there!" });
    } catch (err) {
        log("❌ Greeting Error:", err.message);
        res.status(500).json({ error: "Greeting generation failed." });
    }
});

/* --------------------------------------------------
   🔹 /api/aura/translate — Text translation
-------------------------------------------------- */
router.post("/translate", async (req, res) => {
    try {
        const { text, targetLang = "auto" } = req.body;

        const prompt = targetLang === "auto"
            ? `Detect the language of this text and translate it to the user's preferred language:\n${text}`
            : `Translate this text into ${targetLang}:\n${text}`;

        const result = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
        });

        const translated = result.choices?.[0]?.message?.content || "Translation unavailable.";
        res.json({ translated });
    } catch (err) {
        log("❌ Translation Error:", err.message);
        res.status(500).json({ error: "Translation failed." });
    }
});

/* --------------------------------------------------
   🔹 /api/aura/voice — General command handler
-------------------------------------------------- */
router.post("/voice", async (req, res) => {
    try {
        const { text, voice = "ari" } = req.body;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are ${voice === "agador" ? "Agador" : "Ari"}, one of the AURA twins. 
          Respond naturally and warmly to this user request.`,
                },
                { role: "user", content: text },
            ],
        });

        res.json({
            output: response.choices?.[0]?.message?.content || "I'm here, but I didn’t quite catch that.",
        });
    } catch (err) {
        log("❌ Voice Command Error:", err.message);
        res.status(500).json({ error: "Voice command failed." });
    }
});

/* --------------------------------------------------
   🔹 /api/aura/voice/synthesize — AI voice synthesis
-------------------------------------------------- */
router.post("/voice/synthesize", async (req, res) => {
    try {
        const { text, voice = "ari" } = req.body;

        const outputDir = path.resolve(__dirname, "../../public/audio");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const fileName = `${voice}-${Date.now()}.mp3`;
        const filePath = path.join(outputDir, fileName);

        // Use OpenAI’s TTS model (if available)
        const response = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: voice === "agador" ? "alloy" : "verse",
            input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        const audioUrl = `/audio/${fileName}`;
        log(`🎧 Synthesized speech: ${audioUrl}`);

        res.json({ success: true, audioUrl });
    } catch (err) {
        log("❌ Synthesis Error:", err.message);
        res.status(500).json({ error: "Voice synthesis failed." });
    }
});

/* --------------------------------------------------
   🔹 /api/aura/summarize — NFT / Artwork summarization
-------------------------------------------------- */
router.post("/summarize", async (req, res) => {
    try {
        const { description = "" } = req.body;

        const prompt = `Summarize this NFT or artwork description for a museum visitor in one paragraph, 
    highlighting its meaning and mood:\n${description}`;

        const result = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
        });

        res.json({
            summary: result.choices?.[0]?.message?.content || "Summary unavailable.",
        });
    } catch (err) {
        log("❌ Summarization Error:", err.message);
        res.status(500).json({ error: "Summarization failed." });
    }
});

module.exports = router;

// --------------------------------------------------
// API AURA PERSONALITY ROUTE

//API AURA GREETING PERSONALITY PREFERENCES
const { generateGreeting } = require("../../src/modules/auraContext");

router.post("/greet", async (req, res) => {
    try {
        const { userName, context } = req.body;
        const greeting = await generateGreeting(userName, context || "general");
        res.json({ success: true, greeting });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to generate greeting." });
    }
});

// Add to backend/routes/api/aura.js

const { setPersonality, getPersonality } = require("../../src/modules/auraPersonality");

router.post("/personality/set", (req, res) => {
    try {
        const { userName, twinName, voice, tone, accent, tier = "standard" } = req.body;
        setPersonality(userName, { twinName, voice, tone, accent, tier });
        res.json({ success: true, message: "Twin personality updated." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update personality." });
    }
});

router.get("/personality/:userName", (req, res) => {
    const prefs = getPersonality(req.params.userName);
    if (!prefs) return res.status(404).json({ success: false, message: "No data found." });
    res.json({ success: true, personality: prefs });
});


// 📷 IMAGE TRANSLATION — user hovers camera or uploads screenshot
router.post("/translate/image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) throw new Error("No image uploaded.");

        const buffer = req.file.buffer;
        const tmpPath = "./tmp_" + Date.now() + ".png";
        fs.writeFileSync(tmpPath, buffer);

        const { data: { text } } = await Tesseract.recognize(tmpPath, "eng");
        fs.unlinkSync(tmpPath);

        const result = await AURA.translate(text, req.body.targetLang || "en");
        const speech = await AURA.synthesize(result.translated, req.body.voice || "agador");

        res.json({
            success: true,
            sourceText: text.trim(),
            translatedText: result.translated,
            detectedLanguage: result.detectedLang,
            audioUrl: speech.audioUrl,
        });
    } catch (err) {
        console.error("❌ OCR translation error:", err);
        res.status(500).json({ success: false, message: "Image translation failed." });
    }
});

// 🩺 Health Check
router.get("/health", (req, res) => {
    res.json({ status: "ok", service: "AURA Voice+Vision API", timestamp: new Date().toISOString() });
});

module.exports = router;

// --------------------------------------------------
// 🔊 VOICE PROCESSOR — send voice sample or emotion
// Frontend: sendVoiceToAura()
// --------------------------------------------------
router.post("/voice", upload.single("audio"), async (req, res) => {
    const { voice = "ari", emotion = "calm", text } = req.body;
    try {
        // If audio only, respond using twin greeting
        const query = text || `User sent a new voice message to ${voice}.`;

        const response = await auraVoice.speak(query, voice, emotion);

        res.json({
            ...response,
            info: `Processed by ${response.persona || voice} in ${emotion} mode`,
        });
    } catch (err) {
        console.error("❌ AURA voice processing error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------
// 🧠 TRANSCRIBE — convert uploaded audio to text
// Frontend: getAuraTranscription()
// --------------------------------------------------
router.post("/voice/transcribe", upload.single("audio"), async (req, res) => {
    try {
        const audio = req.file?.buffer;
        if (!audio)
            return res.status(400).json({ success: false, error: "Missing audio file" });

        const result = await auraVoice.transcribe(audio);
        res.json(result);
    } catch (err) {
        console.error("❌ AURA transcription error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------
// 🗣️ SYNTHESIZE — convert AI text into twin voice audio
// Frontend: synthesizeAuraSpeech()
// --------------------------------------------------
router.post("/voice/synthesize", async (req, res) => {
    const { text, voice = "ari", emotion = "calm" } = req.body;
    try {
        const result = await auraVoice.synthesize(text, voice, emotion);
        res.json(result);
    } catch (err) {
        console.error("❌ AURA synthesis error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------
// 🧬 AVAILABLE VOICES — returns all twin personas
// Frontend: getAuraVoices()
// --------------------------------------------------
router.get("/voice/voices", (req, res) => {
    res.json({
        voices: [
            {
                id: "ari",
                name: "Ari",
                accent: "American",
                tone: "Warm, nurturing, empathetic",
                domain: "Guidance, comfort, and connection",
            },
            {
                id: "agador",
                name: "Agador",
                accent: "British",
                tone: "Witty, curious, and refined",
                domain: "Logic, art, creativity, and insight",
            },
        ],
    });
});

// --------------------------------------------------
// 🧿 MEMORY — returns shared twin memory snapshot
// Optional (debug + continuity verification)
// --------------------------------------------------
router.get("/memory", async (req, res) => {
    try {
        const memPath = path.resolve(__dirname, "../../data/aura_memory.json");
        if (!fs.existsSync(memPath))
            return res.status(404).json({ success: false, message: "No memory found." });

        const memory = JSON.parse(fs.readFileSync(memPath, "utf8"));
        res.json({
            success: true,
            memory,
            summary: {
                shared: memory.shared?.length || 0,
                ari: memory.ari?.length || 0,
                agador: memory.agador?.length || 0,
            },
        });
    } catch (err) {
        console.error("❌ AURA memory read error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
