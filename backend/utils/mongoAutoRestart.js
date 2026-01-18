
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

// © 2025 Mia Lopez | CoinPurse™ | MongoDB Auto-Restart Utility
// Automatically ensures MongoDB is active whenever Nodemon restarts.

const { exec } = require("child_process");

function autoRestartMongo() {
    if (process.env.AUTO_MONGO_RESTART === "false") {
        console.log("🧩 Mongo auto-restart disabled by env flag");
        return;
    }

    console.log("🔍 Checking MongoDB status...");
    exec('mongo --eval "db.runCommand({ ping: 1 })"', (error, stdout, stderr) => {
        if (error || stderr) {
            console.warn("⚠️ MongoDB not reachable. Attempting restart...");
            exec('net start MongoDB', (err2, stdout2, stderr2) => {
                if (err2 || stderr2) {
                    console.error("❌ Failed to restart MongoDB service:", err2?.message || stderr2);
                } else {
                    console.log("✅ MongoDB service restarted successfully.");
                }
            });
        } else {
            console.log("✅ MongoDB already running and reachable.");
        }
    });
}

module.exports = autoRestartMongo;
