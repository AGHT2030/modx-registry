
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

// © 2025 AIMAL Global Holdings | MODLINK Voice Streaming Gateway
// Enables bidirectional speech streaming with AURA twins (Agador ↔ Ari)

const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { verifyDAOAccess } = require("./voiceSecurity");
const { MODLINKEmitter } = require("./eventEmitter");
const logger = require("../../logger");

let wss;

/**
 * Initialize WebSocket gateway
 * @param {http.Server} server - Your running HTTP server
 */
function initVoiceStream(server) {
    wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
        if (req.url === "/api/modlink/voice/stream") {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });
        }
    });

    wss.on("connection", async (ws, req) => {
        const dao = req.headers["x-dao"] || "PublicDAO";
        const token = req.headers["authorization"]?.split(" ")[1];

        const check = await verifyDAOAccess(token, dao);
        if (!check.ok) {
            ws.send(JSON.stringify({ error: "Unauthorized or policy violation" }));
            ws.close();
            return;
        }

        logger.info(`🎧 Voice stream connected for ${dao}`);

        ws.on("message", async (message) => {
            try {
                // message = raw audio blob from frontend
                const tempFile = path.join(__dirname, `../../uploads/live_${Date.now()}.webm`);
                fs.writeFileSync(tempFile, message);

                // Transcribe short chunk with Whisper
                const transcription = await client.audio.transcriptions.create({
                    file: fs.createReadStream(tempFile),
                    model: "whisper-1",
                });
                const text = transcription.text.trim();

                // Generate partial response via GPT
                const dialogue = await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are Ari, an empathetic AI concierge in live conversation mode." },
                        { role: "user", content: text },
                    ],
                    temperature: 0.8,
                    stream: true, // streaming output!
                });

                let collected = "";
                dialogue.on("data", (chunk) => {
                    const token = chunk?.choices?.[0]?.delta?.content;
                    if (token) {
                        collected += token;
                        ws.send(JSON.stringify({ partial: token }));
                    }
                });

                dialogue.on("end", async () => {
                    // Generate short TTS snippet
                    const response = await client.audio.speech.create({
                        model: "gpt-4o-mini-tts",
                        voice: "alloy",
                        input: collected,
                    });
                    const buffer = Buffer.from(await response.arrayBuffer());
                    const audioFile = `ari_stream_${Date.now()}.mp3`;
                    const outPath = path.join(__dirname, "../../public/audio", audioFile);
                    fs.writeFileSync(outPath, buffer);

                    // Emit to DAO logs and frontend
                    MODLINKEmitter.hospitality("ARI_STREAM", { dao, text, reply: collected });
                    ws.send(JSON.stringify({ done: true, audioUrl: `/audio/${audioFile}` }));
                    fs.unlink(tempFile, () => { });
                });
            } catch (err) {
                logger.error("Voice stream error:", err);
                ws.send(JSON.stringify({ error: "Processing error" }));
            }
        });

        ws.on("close", () => logger.info(`❌ Voice stream closed for ${dao}`));
    });

    logger.info("✅ MODLINK Voice Streaming Gateway ready");
    return wss;
}

module.exports = { initVoiceStream };
