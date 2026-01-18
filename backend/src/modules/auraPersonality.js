
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

// © 2025 Mia Lopez | AURA Twin Personality Engine
// Handles user personalization, naming, and tier-based voice settings

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const personalityPath = path.join(__dirname, "../../data/auraPersonalities.json");
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

function loadPersonalities() {
    if (!fs.existsSync(personalityPath)) return {};
    return JSON.parse(fs.readFileSync(personalityPath, "utf8"));
}

function savePersonalities(data) {
    fs.writeFileSync(personalityPath, JSON.stringify(data, null, 2));
}

/**
 * Save or update user twin preferences.
 * @param {string} userName
 * @param {object} prefs - { twinName, voice, tone, accent, tier }
 */
function setPersonality(userName, prefs) {
    const db = loadPersonalities();
    db[userName.toLowerCase()] = encrypt(JSON.stringify(prefs));
    savePersonalities(db);
}

/**
 * Get personalized twin data by username.
 */
function getPersonality(userName) {
    const db = loadPersonalities();
    const encrypted = db[userName.toLowerCase()];
    if (!encrypted) return null;
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
}

module.exports = { setPersonality, getPersonality };
