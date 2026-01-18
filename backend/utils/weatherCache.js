
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

// © 2025 Mia Lopez | MODX SuperApp™
// ✅ Weather + Geo Cache Utility with IP Lookup

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const geoip = require("geoip-lite");

let cache = { data: {}, expires: 0 };
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchWeather(req) {
    const now = Date.now();

    // 🌍 Determine user IP + Geo location
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const geo = geoip.lookup(ip) || { city: "Unknown", region: "", country: "", ll: [35.15, -90.05] }; // default Memphis, TN
    const [lat, lon] = geo.ll;

    const cacheKey = `${lat},${lon}`;
    if (cache.data[cacheKey] && cache.expires > now) return cache.data[cacheKey];

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ Missing WEATHER_API_KEY in environment.");
        return { location: "Unknown", temp: "N/A", condition: "Offline mode" };
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.main) throw new Error("Invalid response from OpenWeather");

        const result = {
            location: `${data.name}, ${data.sys.country}`,
            temp: `${data.main.temp.toFixed(1)}°C`,
            condition: data.weather[0].description,
            humidity: `${data.main.humidity}%`,
            wind: `${data.wind.speed} m/s`,
        };

        cache = { data: { [cacheKey]: result }, expires: now + CACHE_TTL };
        return result;
    } catch (err) {
        console.error("❌ Weather fetch error:", err.message);
        return { location: geo.city || "Unknown", temp: "N/A", condition: "Unavailable" };
    }
}

module.exports = { fetchWeather };


