
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

// © 2025 Mia Lopez | CoinPurse™ Backend | MongoDB Auto-Restart Manager

const { execSync } = require("child_process");

async function ensureMongoRunning() {
    try {
        console.log("🔍 Checking MongoDB status...");
        execSync('sc query MongoDB | find "RUNNING"', { stdio: "ignore" });
        console.log("✅ MongoDB is already running.");
        return true;
    } catch {
        console.warn("⚠️ MongoDB not reachable. Attempting restart...");

        try {
            execSync("net start MongoDB", { stdio: "inherit" });
            console.log("✅ MongoDB service restarted successfully.");
            return true;
        } catch (err) {
            if (err.message.includes("Access is denied")) {
                console.warn("⚠️ MongoDB restart skipped — admin rights required.");
            } else {
                console.error("❌ Failed to restart MongoDB service:", err.message);
            }
            return false;
        }
    }
}

module.exports = { ensureMongoRunning };
