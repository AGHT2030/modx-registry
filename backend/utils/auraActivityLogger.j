// © 2025 Mia Lopez | AURA Activity Logger — Clean JSON Safe
// Records AURA twin actions (Ari & Agador) safely to /logs/aura-activity.json

const fs = require("fs");
const path = require("path");

// Log file directory
const logDir = path.resolve(__dirname, "../../logs");
const logFile = path.join(logDir, "aura-activity.json");
const { logActivity } = require("../../utils/auraActivityLogger");

// Ensure directory exists
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Basic sanitization to avoid ghost or malformed characters
function sanitize(input) {
    if (typeof input !== "string") return input;
    return input
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // remove invisible control chars
        .replace(/[“”]/g, '"') // normalize smart quotes
        .replace(/[‘’]/g, "'") // normalize apostrophes
        .replace(/[^\x20-\x7EÀ-ÿ\u4E00-\u9FFF\u0400-\u04FF]/g, ""); // keep readable chars
}

/**
 * Write a new log entry
 * @param {Object} entry - {user, voice, module, action, content}
 */
function logActivity(entry = {}) {
    try {
        const safeEntry = {
            timestamp: new Date().toISOString(),
            user: sanitize(entry.user || "Guest"),
            voice: sanitize(entry.voice || "ari"),
            module: sanitize(entry.module || "general"),
            action: sanitize(entry.action || "speak"),
            content: sanitize(entry.content || ""),
        };

        // Load existing log file or initialize
        let logs = [];
        if (fs.existsSync(logFile)) {
            const raw = fs.readFileSync(logFile, "utf8");
            if (raw.trim()) logs = JSON.parse(raw);
        }
        // inside /voice route
        logActivity({
            user: req.body.userName || "Anonymous",
            voice,
            module: "AURA Voice",
            action: "speak",
            content: text,
        });

        // inside /translate route
        logActivity({
            user: req.body.userName || "Anonymous",
            voice: "ari",
            module: "Translation",
            action: "translate",
            content: `${req.body.text || ""} → ${targetLang}`,
        });

        // inside /voice/synthesize route
        logActivity({
            user: req.body.userName || "Anonymous",
            voice,
            module: "Synthesis",
            action: "synthesize",
            content: text,
        });

        // Append new log
        logs.push(safeEntry);

        // Limit to last 2000 entries for performance
        if (logs.length > 2000) logs = logs.slice(-2000);

        // Write clean JSON file
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), "utf8");
        console.log(`[AURA LOG] + Recorded ${safeEntry.voice} (${safeEntry.action})`);
    } catch (err) {
        console.error("❌ AURA Log Write Error:", err.message);
    }
}

module.exports = { logActivity };
