
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

// © 2025 Mia Lopez | MODX Auto Health Registrar
// Dynamically mounts all *Health.js files under /api/[module]/health

const fs = require("fs");
const path = require("path");

function autoRegisterHealthEndpoints(app, baseDir = path.join(__dirname, "..", "routes", "api")) {
    const files = fs.readdirSync(baseDir).filter(f => f.endsWith("Health.js"));

    files.forEach(file => {
        const moduleName = file.replace("Health.js", "").toLowerCase();
        const route = `/api/${moduleName}`;
        const routePath = path.join(baseDir, file);

        try {
            const handler = require(routePath);
            app.use(route, handler);
            console.log(`✅ Registered health endpoint: ${route}`);
            fs.appendFileSync(
                path.join(__dirname, "..", "logs", "AIRS_CORE_CHANGES.log"),
                `[${new Date().toISOString()}] Registered: ${route}\n`
            );
        } catch (err) {
            console.error(`❌ Failed to register ${route}:`, err.message);
        }
    });
}

module.exports = { autoRegisterHealthEndpoints };
