
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

// © 2025 Mia Lopez | CoinPurse Universal Health Check
// Checks MongoDB, AURA, MODLINK, and DAO status in one pass

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

(async () => {
    console.log("🩺 Starting full backend health scan...\n");

    const checks = {
        "MongoDB": "http://localhost:8083/health",
        "AURA": "http://localhost:8080/health",
        "MODLINK": "http://localhost:8083/api/modlink/health"
    };

    for (const [name, url] of Object.entries(checks)) {
        try {
            const res = await fetch(url, { timeout: 4000 });
            const json = await res.json();
            console.log(`✅ ${name.padEnd(10)} → ${json.status || 'ok'} | ${json.timestamp || ''}`);
        } catch (err) {
            console.log(`❌ ${name.padEnd(10)} → Offline (${err.message})`);
        }
    }

    console.log("\n🔍 Checking DAO registry consistency...");
    try {
        const daoRes = await fetch("http://localhost:8083/api/modlink/dao");
        const daos = await daoRes.json();
        for (const [k, v] of Object.entries(daos)) {
            console.log(`${k.padEnd(15)} → ${v && v !== '0x0000000000000000000000000000000000000000' ? '✅ Active' : '⚠️ Missing'}`);
        }
    } catch {
        console.log("⚠️ DAO registry endpoint unavailable.");
    }

    console.log("\n✅ Health check complete.\n");
})();
