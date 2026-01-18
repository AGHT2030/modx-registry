
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

// © 2025 Mia Lopez | AURA Language Engine
// Handles user language preferences, translation, and context greetings

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const langPath = path.join(__dirname, "../../data/auraLanguagePrefs.json");
const AES_KEY = process.env.AURA_AES_KEY || "moda-voice-encrypt-key";

function encrypt(text) {
    const cipher = crypto.createCipher("aes-256-cbc", AES_KEY);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

function decrypt(text) {
    try {
        const decipher = crypto.createDecipher("aes-256-cbc", AES_KEY);
        let decrypted = decipher.update(text, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch {
        return null;
    }
}

function loadPrefs() {
    if (!fs.existsSync(langPath)) return {};
    return JSON.parse(fs.readFileSync(langPath, "utf8"));
}

function savePrefs(data) {
    fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
}

async function detectLanguage(text) {
    try {
        const res = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Detect the language of the following text and respond with only the language name." },
                { role: "user", content: text },
            ],
        });
        return res.choices?.[0]?.message?.content?.trim() || "English";
    } catch {
        return "English";
    }
}

async function translateText(text, targetLang = "English") {
    try {
        const res = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: `Translate the following text into ${targetLang}.` },
                { role: "user", content: text },
            ],
        });
        return res.choices?.[0]?.message?.content?.trim() || text;
    } catch {
        return text;
    }
}

function setLanguagePref(userName, lang) {
    const prefs = loadPrefs();
    prefs[userName.toLowerCase()] = encrypt(lang);
    savePrefs(prefs);
}

function getLanguagePref(userName) {
    const prefs = loadPrefs();
    const encrypted = prefs[userName.toLowerCase()];
    return encrypted ? decrypt(encrypted) : null;
}

module.exports = {
    detectLanguage,
    translateText,
    setLanguagePref,
    getLanguagePref,
};
