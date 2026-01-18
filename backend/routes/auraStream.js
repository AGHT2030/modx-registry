
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

const path=require('path');\nconst { protectRoutes } = require(path.resolve(__dirname,'../middleware/protectRoutes'));\n// © 2025 Mia Lopez | CoinPurse ™ AURA Realtime Voice API
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const { getResponse } = require("../services/auraDialogue");
const { textToSpeech } = require("../services/textToSpeech");

// 🎤 Accept voice text and return speech response
router.post("/voice", async (req, res) => {
    try {
        const { userText = "", speaker = "Agador" } = req.body;
        if (!userText) return res.status(400).json({ error: "No text provided" });

        const reply = await getResponse(userText, speaker);
        const file = await textToSpeech(reply, speaker);

        logger.info(`🎙️ [${speaker}] replied: ${reply}`);
        res.json({ text: reply, audio: `/audio/${file}` });
    } catch (err) {
        logger.error("Voice API error:", err);
        res.status(500).json({ error: "Voice processing failed" });
    }
});

module.exports = router;



