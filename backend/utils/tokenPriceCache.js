
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
// ✅ Token Price Cache Utility (ESM-Compatible)

let priceCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchTokenPrices(symbols = []) {
    const now = Date.now();
    const ids = symbols.map((s) => s.toLowerCase()).join(",");

    // 🧠 Cache check
    if (priceCache[ids] && priceCache[ids].expires > now) {
        return priceCache[ids].data;
    }

    try {
        const fetch = (await import("node-fetch")).default;
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        const data = await response.json();

        priceCache[ids] = { data, expires: now + CACHE_TTL };
        return data;
    } catch (err) {
        console.error("❌ Failed to fetch token prices:", err.message);
        return {};
    }
}

module.exports = { fetchTokenPrices };



