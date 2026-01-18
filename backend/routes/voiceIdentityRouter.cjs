
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

// © 2025 Mia Lopez | Voice Identity API Router

const express = require("express");
const router = express.Router();

const { enrollVoiceIdentity } = require("../aura/voice/voiceEnrollment");
const { voiceLogin, authorizeVoiceCommand } = require("../aura/voice/voiceAuth");
const { bindRightsToVoiceIdentity } = require("../aura/voice/voiceNFT");

// NOTE: In production, audio → voiceFeatures will happen via
// a separate microservice (Whisper/DeepSpeech/etc). Here we pass features directly.

/**
 * POST /api/voice/enroll
 * body: { userId, voiceFeatures, iso20022Party }
 */
router.post("/voice/enroll", async (req, res) => {
    try {
        const { userId, voiceFeatures, iso20022Party } = req.body;
        const result = enrollVoiceIdentity({ userId, voiceFeatures, iso20022Party });
        res.json({ ok: true, result });
    } catch (err) {
        console.error("Voice enrollment error:", err);
        res.status(400).json({ ok: false, error: err.message });
    }
});

/**
 * POST /api/voice/login
 * body: { userId, voiceFeatures }
 */
router.post("/voice/login", async (req, res) => {
    try {
        const { userId, voiceFeatures } = req.body;
        const result = voiceLogin({ userId, voiceFeatures });
        res.json({ ok: true, ...result });
    } catch (err) {
        console.error("Voice login error:", err);
        res.status(400).json({ ok: false, error: err.message });
    }
});

/**
 * POST /api/voice/rights/bind
 * body: { userId, rights: { music: [...], patents: [...], copyright: [...] } }
 */
router.post("/voice/rights/bind", async (req, res) => {
    try {
        const { userId, rights } = req.body;
        const merged = bindRightsToVoiceIdentity({ userId, rights });
        res.json({ ok: true, rights: merged });
    } catch (err) {
        console.error("Voice rights bind error:", err);
        res.status(400).json({ ok: false, error: err.message });
    }
});

/**
 * POST /api/voice/command/auth
 * body: { commandKey, voiceFeatures }
 * → used by Mission Control to gate Neural Mesh modes
 */
router.post("/voice/command/auth", async (req, res) => {
    try {
        const { commandKey, voiceFeatures } = req.body;
        const result = authorizeVoiceCommand({ commandKey, voiceFeatures });
        res.json({ ok: true, ...result });
    } catch (err) {
        console.error("Voice command auth error:", err);
        res.status(400).json({ ok: false, error: err.message });
    }
});

module.exports = router;
