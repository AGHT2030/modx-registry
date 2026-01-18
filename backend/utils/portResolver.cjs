
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

// © 2025 AIMAL Global Holdings | Smart Port Resolver
// Finds the next available port if the default is in use

const net = require("net");

exports.findAvailablePort = (basePort = 8083, maxAttempts = 10) => {
    return new Promise((resolve) => {
        const tryPort = (port, attempt) => {
            const server = net.createServer();
            server.once("error", (err) => {
                if (err.code === "EADDRINUSE" && attempt < maxAttempts) {
                    console.warn(`⚠️ Port ${port} in use — trying ${port + 1}`);
                    tryPort(port + 1, attempt + 1);
                } else {
                    console.error(`❌ Unable to find available port after ${attempt} attempts.`);
                    resolve(basePort); // fallback
                }
            });

            server.once("listening", () => {
                server.close(() => resolve(port));
            });

            server.listen(port);
        };

        tryPort(basePort, 1);
    });
};
