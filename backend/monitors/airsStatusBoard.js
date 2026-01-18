
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

// © 2025 Mia Lopez | AIRS Status Board
// Live color-coded uptime dashboard for AIRS hybrid modules

const axios = require("axios");
const chalk = require("chalk");
const Table = require("cli-table3");

const modules = {
    AIRS: "http://localhost:8083/api/airs/health",
    MODE: "http://localhost:8083/api/mode/health",
    CREATV: "http://localhost:8083/api/creatv/health",
    MODA_STAY: "http://localhost:8083/api/moda-stay/health",
};

async function checkModules() {
    const table = new Table({
        head: [chalk.cyan("Module"), chalk.cyan("Status"), chalk.cyan("Uptime (s)"), chalk.cyan("Timestamp")],
        colWidths: [15, 10, 15, 35],
    });

    for (const [name, url] of Object.entries(modules)) {
        try {
            const res = await axios.get(url, { timeout: 4000 });
            const data = res.data || {};
            table.push([
                name,
                chalk.bgGreen.black(" ONLINE "),
                (data.uptime || process.uptime()).toFixed(1),
                new Date().toLocaleTimeString(),
            ]);
        } catch (err) {
            table.push([
                name,
                chalk.bgRed.white(" OFFLINE "),
                "—",
                new Date().toLocaleTimeString(),
            ]);
        }
    }

    console.clear();
    console.log(chalk.bold.cyan("🩺 AIRS Hybrid System Status — Live Heartbeat Grid"));
    console.log(chalk.gray(`Refreshed: ${new Date().toLocaleString()}`));
    console.log(table.toString());
}

setInterval(checkModules, 5000);
checkModules();
