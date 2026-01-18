
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
// Handles Speech-to-Text (STT) transcription requests for AURA Cognition
// Integrates with OpenAI Whisper / Mozilla DeepSpeech / local speech API

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const logger = require("../../../logger");

const router = express.Router();

// 🎙️ Temporary storage for uploads
const upload = multer({ dest: path.join(__dirname, "../../../uploads") });

// 🔊 POST /api/aura/whisper
// Accepts an audio file and returns a text transcription
router.post("/", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided." });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;

        logger.info(`🎧 Whisper STT received: ${fileName}`);

        // 🧠 Simulate transcription (replace with OpenAI Whisper or Mozilla DeepSpeech)
        const mockTranscription = `Transcription placeholder for ${fileName}`;

        // Cleanup uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) logger.warn("Could not delete temp file:", filePath);
        });

        res.json({
            status: "ok",
            file: fileName,
            transcription: mockTranscription,
        });
    } catch (err) {
        logger.error("❌ Whisper transcription failed:", err);
        res.status(500).json({ error: "Transcription failed." });
    }
});

module.exports = router;
