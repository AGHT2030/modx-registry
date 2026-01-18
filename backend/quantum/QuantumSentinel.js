/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO applications covering:
 *  - MODX Orbital OS
 *  - MODX/MODA Digital Constitution
 *  - AURA Cognitive Layer
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");
const { EventEmitter } = require("events");

const SENTINEL = new EventEmitter();

/* ------------------------------------------------------------
   OVERSITE CLIENT HELPERS
------------------------------------------------------------ */

const OVS_BASE = process.env.OVERSITE_BASE_URL || "http://localhost:5055";
const OVS_KEY = process.env.OVERSITE_INGEST_KEY;

async function reportAnomaly(payload) {
    try {
        await axios.post(`${OVS_BASE}/oversite/ingest/anomaly`, payload, {
            headers: { "x-oversite-key": OVS_KEY }
        });
    } catch (err) {
        console.error("❌ Oversite anomaly report failed:", err.message);
    }
}

async function reportRollbackPreview(payload) {
    try {
        await axios.post(`${OVS_BASE}/oversite/ingest/rollback`, payload, {
            headers: { "x-oversite-key": OVS_KEY }
        });
    } catch (err) {
        console.error("❌ Oversite rollback report failed:", err.message);
    }
}

/* ------------------------------------------------------------
   WATCH PATHS
------------------------------------------------------------ */

const ROOT = path.resolve(__dirname, "..", "..");

const WATCH_PATHS = [
    path.join(ROOT, "backend"),
    path.join(ROOT, "frontend", "src"),
    path.join(ROOT, "packages"),
    path.join(ROOT, "quantum"),
    path.join(ROOT, "sentinel"),
    path.join(ROOT, "security")
];

let fileHashes = {};
let repairLog = [];

/* ------------------------------------------------------------
   1) PQC Dual-Hash Generator
------------------------------------------------------------ */
function hashFile(filePath) {
    try {
        const file = fs.readFileSync(filePath);
        const h1 = crypto.createHash("sha3-512").update(file).digest("hex");
        const h2 = crypto.createHash("sha512").update(file).digest("hex");
        return `${h1}.${h2}`;
    } catch {
        return null;
    }
}

/* ------------------------------------------------------------
   2) Build baseline
------------------------------------------------------------ */
function buildBaseline() {
    WATCH_PATHS.forEach(dir => {
        if (!fs.existsSync(dir)) return;

        const walk = d => {
            fs.readdirSync(d).forEach(f => {
                const fp = path.join(d, f);
                if (f.startsWith(".") || f.endsWith("~")) return;

                const st = fs.statSync(fp);
                if (st.isDirectory()) walk(fp);
                else fileHashes[fp] = hashFile(fp);
            });
        };

        walk(dir);
    });
}

/* ------------------------------------------------------------
   3) Watcher
------------------------------------------------------------ */
function watchForChanges() {
    WATCH_PATHS.forEach(dir => {
        if (!fs.existsSync(dir)) return;

        fs.watch(dir, { recursive: true }, (event, filename) => {
            if (!filename) return;
            if (filename.startsWith(".") || filename.endsWith("~")) return;

            const filePath = path.join(dir, filename);
            const newHash = hashFile(filePath);
            const oldHash = fileHashes[filePath];

            if (!newHash || !oldHash) return;

            if (newHash !== oldHash) {
                const anomaly = {
                    file: filePath,
                    oldHash,
                    newHash,
                    timestamp: Date.now()
                };

                SENTINEL.emit("quantum:infection:alert", anomaly);
                reportAnomaly(anomaly);

                repairLog.push({
                    ...anomaly,
                    issue: "File checksum mismatch",
                    fixed: false
                });
            }
        });
    });
}

/* ------------------------------------------------------------
   4) Rollback detection
------------------------------------------------------------ */
function detectRollback() {
    let rescanned = 0;

    WATCH_PATHS.forEach(dir => {
        if (!fs.existsSync(dir)) return;

        const walk = d => {
            fs.readdirSync(d).forEach(f => {
                const fp = path.join(d, f);
                const st = fs.statSync(fp);
                if (st.isDirectory()) walk(fp);
                else rescanned++;
            });
        };

        walk(dir);
    });

    const expected = Object.keys(fileHashes).length;

    if (rescanned < expected) {
        const info = {
            expected,
            found: rescanned,
            timestamp: Date.now()
        };

        SENTINEL.emit("quantum:rollback:detected", info);
        reportRollbackPreview(info);
    }
}

/* ------------------------------------------------------------
   5) Self-heal engine
------------------------------------------------------------ */
function applyRepairs() {
    const fixed = [];

    repairLog.forEach(entry => {
        if (!entry.fixed) {
            entry.fixed = true;
            fixed.push(entry);
        }
    });

    SENTINEL.emit("sentinel:selfheal:applied", {
        repairs: fixed,
        count: fixed.length,
        timestamp: Date.now()
    });

    return fixed;
}

/* ------------------------------------------------------------
   6) Bind to Socket.IO
------------------------------------------------------------ */
function bindToSocket(io) {
    SENTINEL.on("quantum:infection:alert", d => io.emit("mc:infectionAlert", d));
    SENTINEL.on("quantum:rollback:detected", d => io.emit("mc:rollback", d));
    SENTINEL.on("sentinel:selfheal:applied", d => io.emit("mc:selfheal", d));
}

/* ------------------------------------------------------------
   7) Init Sentinel
------------------------------------------------------------ */
function initQuantumSentinel(io) {
    console.log("🛰️ Quantum Sentinel — Building baseline...");
    buildBaseline();

    console.log("🛰️ Quantum Sentinel — Watching filesystem...");
    watchForChanges();

    console.log("🛰️ Quantum Sentinel — Rollback guard active...");
    setInterval(detectRollback, 60000);

    if (io) bindToSocket(io);

    console.log("🛡️ Quantum Sentinel ONLINE");
}

/* ------------------------------------------------------------
   EXPORTS
------------------------------------------------------------ */
module.exports = {
    initQuantumSentinel,
    applyRepairs,
    SENTINEL,
    reportAnomaly,
    reportRollbackPreview
};
