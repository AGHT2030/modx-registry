
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

// backend/diagnostics/rollbackDetector.cjs
/**
 * © 2025 Mia Lopez | Rollback Detector Engine (Black Hole R)
 * Detects state regression attempts, stale modules, or replaced files.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TRACK_FILE = path.join(__dirname, "stateHashes.json");

function getFileHash(filePath) {
    try {
        const data = fs.readFileSync(filePath);
        return crypto.createHash("sha256").update(data).digest("hex");
    } catch {
        return null;
    }
}

function scanProject() {
    const targetDirs = [
        "../backend",
        "../frontend/src",
        "../backend/quantum",
        "../backend/security"
    ];

    let results = {};

    targetDirs.forEach(dir => {
        const full = path.join(__dirname, dir);
        if (!fs.existsSync(full)) return;

        function walk(d) {
            fs.readdirSync(d).forEach(item => {
                const itemPath = path.join(d, item);
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) return walk(itemPath);
                if (!itemPath.endsWith(".js") && !itemPath.endsWith(".jsx") && !itemPath.endsWith(".cjs")) return;

                results[itemPath] = getFileHash(itemPath);
            });
        }
        walk(full);
    });

    return results;
}

function detectRollback() {
    const newHashes = scanProject();
    const oldHashes = fs.existsSync(TRACK_FILE)
        ? JSON.parse(fs.readFileSync(TRACK_FILE))
        : {};

    let alerts = [];

    for (const file in newHashes) {
        if (!oldHashes[file]) continue;

        if (newHashes[file] !== oldHashes[file]) {
            alerts.push({
                file,
                type: "ROLLBACK_DETECTED",
                oldHash: oldHashes[file],
                newHash: newHashes[file],
                timestamp: Date.now()
            });
        }
    }

    fs.writeFileSync(TRACK_FILE, JSON.stringify(newHashes, null, 2));

    return alerts;
}

module.exports = { detectRollback };
