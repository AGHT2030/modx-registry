
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

// © 2025 Mia Lopez | MODLINK DAO Auto-Updater
// Automatically syncs deployed DAO contract addresses into vault.json
// Safe for Node v18–20 | PM2 compatible

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// --- CONFIG PATHS ---
const VAULT_PATH = path.resolve(__dirname, "vault.json");
const DEPLOY_PATH = path.resolve(__dirname, "../../abis");
const BACKUP_PATH = path.resolve(__dirname, "vault.backup.json");

// --- HELPER: Read contract address from ABI/deployment file ---
function findAddress(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        // Works with Hardhat-style deployments or abis with address field
        return data.address || data.contractAddress || null;
    } catch {
        return null;
    }
}

// --- HELPER: Log colorfully ---
const log = (msg, color = "\x1b[36m") => console.log(`${color}${msg}\x1b[0m`);

// --- MAIN EXECUTION ---
try {
    log("🔍 Loading current vault...");
    const vault = JSON.parse(fs.readFileSync(VAULT_PATH, "utf-8"));
    if (!vault.daos) vault.daos = {};

    log("💾 Backing up existing vault...");
    fs.copyFileSync(VAULT_PATH, BACKUP_PATH);

    const modules = [
        "airs",
        "moda",
        "coinpurse",
        "mode",
        "creatv",
        "modaStayHybrid",
        "modaRetail",
        "modaInvest",
        "modaDao"
    ];

    let updated = 0;
    for (const mod of modules) {
        const patterns = [
            path.join(DEPLOY_PATH, `${mod}.json`),
            path.join(DEPLOY_PATH, `${mod.toUpperCase()}.json`),
            path.join(DEPLOY_PATH, `${mod}.abi.json`),
            path.join(DEPLOY_PATH, `${mod}.deployment.json`)
        ];

        let address = null;
        for (const file of patterns) {
            if (fs.existsSync(file)) {
                address = findAddress(file);
                if (address) break;
            }
        }

        if (address) {
            vault.daos[mod] = address;
            log(`✅ Updated ${mod.toUpperCase()} DAO → ${address}`, "\x1b[32m");
            updated++;
        } else {
            log(`⚠️ No address found for ${mod} (leaving previous)`, "\x1b[33m");
        }
    }

    vault.lastUpdated = new Date().toISOString();
    fs.writeFileSync(VAULT_PATH, JSON.stringify(vault, null, 4));
    log(`\n💾 Vault updated successfully. ${updated} DAO(s) refreshed.`);
    log("🕒 Last updated: " + vault.lastUpdated);

    // --- Auto-restart backend ---
    log("\n♻️ Restarting CoinPurse backend via PM2...");
    execSync("pm2 restart coinpurse-backend --update-env", { stdio: "inherit" });
    log("✅ PM2 restart complete.");

} catch (err) {
    console.error("❌ Error updating vault:", err);
    process.exit(1);
}
