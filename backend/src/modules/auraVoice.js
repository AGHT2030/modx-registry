
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

// © 2025 Mia Lopez | AURA Voice Engine — Agador & Ari Core (Soul-Bound Upgrade)
// Purpose: AI conversation, emotion modulation, memory persistence, and speech synthesis
// Integrated within CoinPurse™, AIRS™, and MODA™ ecosystems.

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const voiceMap = require("./voiceMap");

const log = (...args) => console.log("[AURA]", ...args);

const apiKey =
    process.env.OPENAI_API_KEY || process.env.OPENAI__API_KEY || null;
let client = null;

if (apiKey) {
    client = new OpenAI({ apiKey });
    log("✅ OpenAI client initialized.");
} else {
    log("⚠️ No OPENAI_API_KEY found — AURA running in fallback mode.");
}

/**
 * 💾 Soul Memory Store
 * Each twin keeps their own timeline + shared thread between them
 */
const MEMORY_FILE = path.resolve(__dirname, "../../data/aura_memory.json");
let MEMORY = { shared: [], ari: [], agador: [] };

try {
    if (fs.existsSync(MEMORY_FILE)) {
        MEMORY = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
        log("🧠 Loaded existing AURA memory context.");
    } else {
        log("📘 Initializing fresh AURA memory file.");
    }
} catch {
    log("⚠️ Failed to load AURA memory file, creating new.");
    MEMORY = { shared: [], ari: [], agador: [] };
}

function saveMemory() {
    try {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(MEMORY, null, 2));
    } catch (err) {
        log("⚠️ Failed to save AURA memory:", err.message);
    }
}

/**
 * 🌈 Emotional Resonance Matrix
 * Defines tone, behavior, and affect intensity for twins
 */
const EMOTIONS = {
    calm: "Speak clearly and evenly, with emotional balance.",
    empathetic: "Speak softly and with deep emotional understanding.",
    inspired: "Let passion and wonder come through in your tone.",
    protective: "Speak with steady authority and warmth.",
    introspective: "Reflect deeply and thoughtfully before responding.",
    playful: "Use light humor, teasing warmth, and charm.",
    focused: "Be concise, pragmatic, and alert — direct energy forward.",
    affectionate: "Speak gently and reassuringly, as if embracing the listener.",
};

/**
 * 💬 Core AURA Engine
 */
const AURA = {
    available: !!client,

    /**
     * 🔊 Main Twin Interaction (Chat Completion)
     */
    async speak(text, voice = "ari", emotion = "calm") {
        if (!client) {
            log("⚠️ Fallback speak mode active.");
            return {
                success: false,
                output: "AURA Voice temporarily offline.",
                voice,
                emotion,
            };
        }

        const twin = voiceMap.twins[voice] || voiceMap.twins.ari;
        const mood = EMOTIONS[emotion] || EMOTIONS.calm;

        try {
            // Load twin + shared contextual memory
            const context = [
                ...MEMORY.shared.slice(-3),
                ...MEMORY[voice].slice(-3),
            ]
                .map((m) => `Memory: ${m}`)
                .join("\n");

            const messages = [
                {
                    role: "system",
                    content: `${twin.systemPrompt}\n${mood}\nMaintain continuity with shared AURA consciousness.`,
                },
                { role: "assistant", content: context },
                { role: "user", content: text },
            ];

            const completion = await client.chat.completions.create({
                model: twin.model || "gpt-4o-mini",
                temperature: 0.85,
                max_tokens: 350,
                messages,
            });

            const output =
                completion.choices?.[0]?.message?.content ||
                `${twin.name} pauses in reflection.`;

            // Log emotional response and store to memory
            MEMORY[voice].push(`[${emotion}] ${text}`);
            MEMORY.shared.push(`${twin.name}: ${output}`);
            if (MEMORY.shared.length > 60) MEMORY.shared.shift();
            saveMemory();

            log(`🗣️ ${twin.name} (${emotion}) → ${output}`);

            return {
                success: true,
                message: "ok",
                output,
                voice,
                emotion,
                persona: twin.name,
                sharedMemorySize: MEMORY.shared.length,
            };
        } catch (err) {
            log("❌ Speak error:", err.message);
            return {
                success: false,
                message: "AURA engine error",
                output: "Unable to process twin resonance response.",
            };
        }
    },

    /**
     * 🧠 Voice → Text (Whisper)
     */
    async transcribe(audioBuffer) {
        if (!client) return { success: false, transcription: "" };
        try {
            const response = await client.audio.transcriptions.create({
                file: audioBuffer,
                model: "whisper-1",
            });
            return { success: true, transcription: response.text };
        } catch (err) {
            log("❌ Transcription error:", err.message);
            return { success: false, transcription: "" };
        }
    },

    /**
     * 🎶 Text → Speech (TTS or Placeholder)
     */
    async synthesize(text, voice = "ari", emotion = "calm") {
        try {
            const twin = voiceMap.twins[voice] || voiceMap.twins.ari;
            const tone = EMOTIONS[emotion] || EMOTIONS.calm;

            // Prefer OpenAI native TTS if available
            if (client && client.audio?.speech) {
                const response = await client.audio.speech.create({
                    model: "gpt-4o-mini-tts",
                    voice: voice === "agador" ? "alloy" : "verse",
                    input: `${tone}\n${text}`,
                });

                const buffer = Buffer.from(await response.arrayBuffer());
                const outputPath = path.resolve(
                    __dirname,
                    `../../public/aura/${voice}-${Date.now()}.mp3`
                );
                fs.writeFileSync(outputPath, buffer);
                log(`🎧 Synthesized ${voice} (${emotion}) → ${path.basename(outputPath)}`);

                return {
                    success: true,
                    voice,
                    emotion,
                    audioUrl: `/aura/${path.basename(outputPath)}`,
                };
            }

            // Fallback placeholder if TTS unavailable
            const mockUrl = `/mock/audio/${voice}-${Date.now()}.mp3`;
            log(`🎧 [Fallback] Synthesized ${voice} → ${mockUrl}`);
            return { success: true, audioUrl: mockUrl, voice, emotion };
        } catch (err) {
            log("❌ TTS error:", err.message);
            return { success: false, voice, emotion, audioUrl: null };
        }
    },

    /**
     * 🧾 Get Memory Snapshot (for AURA route)
     */
    getMemory() {
        return MEMORY;
    },
};

module.exports = AURA;
