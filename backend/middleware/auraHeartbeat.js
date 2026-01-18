
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

// © 2025 Mia Lopez | AIMAL Global Holdings
// AURA Heartbeat Watchdog (CommonJS version)

const { exec } = require("child_process");
const nodemailer = require("nodemailer");
const chalk = require("chalk");

const MONITORED_SERVICES = [
    "coinpurse-backend",
    "modx-server",
    "sentinel-core",
    "aura-spectrum",
];

function startHeartbeatMonitor() {
    console.log(chalk.cyan("💓  AURA Heartbeat Monitor active..."));

    setInterval(() => {
        MONITORED_SERVICES.forEach((svc) => {
            exec(`pm2 show ${svc}`, (err, stdout, stderr) => {
                if (err || stderr || !stdout.includes("status: online")) {
                    alertTrustees(svc);
                    console.error(chalk.red(`❌ ${svc} heartbeat failed.`));
                }
            });
        });
    }, 60_000); // every minute
}

function alertTrustees(service) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ALERT_EMAIL,
            pass: process.env.ALERT_PASS,
        },
    });

    transporter.sendMail({
        from: process.env.ALERT_EMAIL,
        to: process.env.TRUSTEE_EMAILS,
        subject: `AURA Heartbeat Alert — ${service}`,
        text: `Service ${service} failed heartbeat check. Auto-recovery pending.`,
    });
}

module.exports = { startHeartbeatMonitor };
