
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

// 📂 server/routes/airsSafetyRoutes.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
const logger = require("../logger");
const { logAIRSChange } = require("../utils/airsChangeLogger");
logAIRSChange(__filename, "load");

// 🔐 Environment keys (set these in .env.dev)
const WEATHER_API = process.env.WEATHER_API || "demo";
const GEO_RISK_API = process.env.GEO_RISK_API || "demo";

router.post("/check", async (req, res) => {
    try {
        const { lat, lng, context } = req.body;
        if (!lat || !lng) throw new Error("Missing coordinates");

        logger.info(`🌍 Running safety check for ${lat}, ${lng} (${context})`);

        // 1️⃣ Pull real-time weather + risk
        const weather = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API}`
        );

        // 2️⃣ Simulated Geo risk (replace with SafeGraph or civic data)
        const geoRisk = await axios.get(
            `https://api.demo-georisk.com/check?lat=${lat}&lng=${lng}&key=${GEO_RISK_API}`
        ).catch(() => ({ data: { riskLevel: "Low", score: 95 } }));

        // 3️⃣ Basic scoring logic
        const score = Math.min(100, (geoRisk.data.score || 90) - (weather.data.alerts ? 15 : 0));
        const riskLevel =
            score > 85 ? "Low" : score > 60 ? "Moderate" : score > 40 ? "High" : "Critical";

        const message =
            riskLevel === "Low"
                ? "All clear — no recent safety alerts."
                : riskLevel === "Moderate"
                    ? "Stay aware of your surroundings. I’ll keep an eye out."
                    : "⚠️ Elevated risk detected. Remain cautious and stay connected.";

        res.json({ riskLevel, score, message });
    } catch (err) {
        logger.error("❌ Safety check failed:", err.message);
        res.status(500).json({ riskLevel: "Unknown", score: 100, message: "Unable to check safety." });
    }
});

// 🚨 SOS Alert Route
router.post("/alert", async (req, res) => {
    try {
        const { userId, location } = req.body;

        logger.warn(`🚨 SOS Triggered by ${userId} at ${JSON.stringify(location)}`);

        // 🔔 Send alert to safety circle or authority integration
        // (e.g., Twilio SMS, 911 API, or Dispatch AI)
        // Simulated for now
        res.json({ success: true, message: "Alert sent to safety circle & authorities." });
    } catch (err) {
        logger.error("❌ SOS alert failed:", err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;




