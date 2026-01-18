
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

// 📂 backend/services/safetySentinel.js
import axios from "axios";

export async function getSafetyStatus(lat, lng) {
    try {
        const [crime, weather] = await Promise.all([
            axios.get(`https://api.safecity.io/v1/heatmap?lat=${lat}&lng=${lng}`),
            axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: { lat, lon: lng, appid: process.env.OPENWEATHER_KEY },
            }),
        ]);

        const score =
            100 -
            (crime.data.riskIndex * 20 +
                (weather.data.alerts?.length ? 30 : 0));

        return {
            score: Math.max(0, Math.min(score, 100)),
            riskLevel: score > 75 ? "Low" : score > 50 ? "Medium" : "High",
            alerts: weather.data.alerts || [],
        };
    } catch (err) {
        console.error("Safety check error", err);
        return { score: 80, riskLevel: "Unknown", alerts: [] };
    }
}

