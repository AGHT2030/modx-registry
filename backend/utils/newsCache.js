
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
// ✅ MODX News Cache Utility (Dynamic Import Fix for Node v20+)

let fetchFn; // Lazy import

async function getFetch() {
    if (!fetchFn) {
        const mod = await import("node-fetch");
        fetchFn = mod.default;
    }
    return fetchFn;
}

let newsCache = { data: [], expires: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchMODXNews() {
    const now = Date.now();

    if (newsCache.expires > now && newsCache.data.length > 0) {
        return newsCache.data;
    }

    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            throw new Error("Missing NEWS_API_KEY in environment");
        }

        const fetch = await getFetch();
        console.log("📰 Fetching MODX/MODA-related news...");

        const response = await fetch(
            `https://newsapi.org/v2/everything?q=MODX+MODA+blockchain&sortBy=publishedAt&apiKey=${apiKey}`,
            { timeout: 8000 }
        );

        if (!response.ok) {
            throw new Error(`NewsAPI responded with status ${response.status}`);
        }

        const data = await response.json();

        const headlines = (data.articles || [])
            .slice(0, 5)
            .map((a) => ({
                title: a.title || "Untitled",
                source: a.source?.name || "Unknown",
                url: a.url || "#",
                published: a.publishedAt || new Date().toISOString(),
            }));

        newsCache = {
            data: headlines,
            expires: now + CACHE_TTL,
        };

        console.log(`✅ News cache updated (${headlines.length} articles).`);
        return headlines;
    } catch (err) {
        console.warn("⚠️ Failed to fetch MODX news:", err.message);
        console.log("💡 Using fallback news headlines (offline mode).");

        const fallback = [
            {
                title: "MODA Coin Surges on New Blockchain Partnerships",
                source: "CoinDesk",
                url: "#",
                published: new Date().toISOString(),
            },
            {
                title: "CoinPurse™ Expands MODX Ecosystem Across the U.S.",
                source: "TechCrunch",
                url: "#",
                published: new Date().toISOString(),
            },
            {
                title: "MODX SuperApp Integrates AI Concierge and NFTs",
                source: "Decrypt",
                url: "#",
                published: new Date().toISOString(),
            },
        ];

        newsCache = {
            data: fallback,
            expires: now + CACHE_TTL,
        };

        return fallback;
    }
}

module.exports = { fetchMODXNews };



