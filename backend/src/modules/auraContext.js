
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

// © 2025 Mia Lopez | AURA Context Engine
// Remembers user environment, greets with adaptive tone

const { getPersonality } = require("./auraPersonality");
const { getLanguagePref } = require("./auraLanguage");
const AURA = require("./auraVoice");

async function generateGreeting(userName, context = "general") {
    const personality = getPersonality(userName) || {};
    const lang = getLanguagePref(userName) || "English";

    const twin = personality.voice || "ari";
    const name = personality.twinName || (twin === "ari" ? "Ari" : "Agador");

    const prompt = `
Generate a warm and context-aware greeting in ${lang}.
Context: ${context}.
Respond as ${name}, using tone "${personality.tone || "friendly"}".
Include the user's name (${userName}) naturally in the greeting.
`;

    const res = await AURA.speak(prompt, twin, "empathetic");
    return res.output;
}

module.exports = { generateGreeting };
