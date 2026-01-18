
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

// © 2025 AIMAL Global Holdings | AURA FeelTalk Translator
// Converts raw emotional metrics into emotionally natural phrasing
// Human-first phrasing for users, analytic phrasing for brands.

function toneTranslator(data = {}, audience = "user") {
    const {
        avgMood = 0.5,
        avgStress = 0.5,
        trend = "steady",
        productName,
        context
    } = data;

    const moodWords = [
        "vibrant", "serene", "energized", "chill", "upbeat", "focused", "refreshed", "radiant"
    ];
    const stressWords = [
        "calm", "balanced", "rested", "unwinding", "steady", "lighter", "centered"
    ];

    const toneWord = moodWords[Math.floor(Math.random() * moodWords.length)];
    const stressWord = stressWords[Math.floor(Math.random() * stressWords.length)];
    const thing = productName || context || "this experience";

    // 🧍 User-facing phrasing (Ari voice)
    if (audience === "user") {
        switch (trend) {
            case "up":
                return `Feels great in here — everything seems ${toneWord}.`;
            case "down":
                return `It’s a bit quieter right now — maybe everyone’s ${stressWord} or taking a break.`;
            case "steady":
            default:
                return `Looks balanced — steady energy all around.`;
        }
    }

    // 🏢 Brand-facing phrasing (analytics / corporate)
    if (audience === "brand") {
        switch (trend) {
            case "up":
                return `Engagement rising — guests are responding better to ${thing}.`;
            case "down":
                return `Engagement dipping slightly — responses to ${thing} are softer today.`;
            case "steady":
            default:
                return `Engagement steady for ${thing}, mood levels consistent.`;
        }
    }

    // 🧩 Fallback (neutral tone)
    return `The vibe feels ${toneWord} and ${stressWord} overall.`;
}

module.exports = toneTranslator;

