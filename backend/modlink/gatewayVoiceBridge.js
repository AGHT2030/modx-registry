
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

// © 2025 AIMAL Global Holdings | MODLINK Voice Gateway Bridge
// Ensures all AURA voice routes (Whisper + TTS + Dialogue) pass through DAO governance
// before processing. This is your compliance lock layer for all voice data.

const express = require("express");
const router = express.Router();
const { registry } = require("./registry");
const logger = require("../../logger");
const fs = require("fs");
const path = require("path");

// Policy map (can be externalized to JSON later)
const voicePolicies = {
    FinanceDAO: ["KYC", "AML"],
    HealthDAO: ["HIPAA", "Consent"],
    HospitalityDAO: ["GuestAccess"],
    EntertainmentDAO: ["AgeCheck"],
};

// Dynamic loader for AURA subroutes
const auraWhisper = require("../routes/aura/whisper");
const auraTTS = require("../routes/aura/tts");

// 🔐 Middleware: validate DAO compliance for voice data
router.use(async (req, res, next) => {
    try {
        const tokenPayload = req.modlink?.tokenPayload || {};
        const dao = tokenPayload.dao || "PublicDAO";
        const requiredPolicies = voicePolicies[dao] || [];

        if (requiredPolicies.length > 0 && req.modlink?.checkPolicy) {
            const check = req.modlink.checkPolicy({ dao, requiredPolicies });
            if (!check.ok) {
                logger?.warn(`🚫 Voice policy violation for ${dao}: ${check.reason}`);
                return res.status(403).json({
                    error: `DAO Policy violation on voice data`,
                    dao,
                    requiredPolicies,
                });
            }
        }

        // ✅ Log sanitized event
        const logDir = path.join(__dirname, "../../logs/voice");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(
            path.join(logDir, `${dao}_voice.log`),
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`
        );

        next();
    } catch (err) {
        logger?.error("Voice Gateway Policy Error:", err);
        res.status(401).json({ error: "Voice data authorization failed" });
    }
});

// 🧠 Route traffic through the verified submodules
router.use("/whisper", auraWhisper);
router.use("/tts", auraTTS);

// 🩵 Health check for monitoring
router.get("/status", (req, res) => {
    res.json({
        status: "✅ MODLINK Voice Gateway active",
        routes: ["/whisper", "/tts"],
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
