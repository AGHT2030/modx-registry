
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

// © 2025 AIMAL Global Holdings | AURA Cognitive Bootstrap
// Unifies all cognitive modules under global.AURA_TWINS.cognition
// Ensures shared memory context across spectrum, metrics & twin emitters.

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// ---------------------------------------------------------------------------
// 1️⃣ Locate cognitive folder
// ---------------------------------------------------------------------------
const COGNITIVE_PATH = path.resolve(__dirname, "./admin/cognitive");

// ---------------------------------------------------------------------------
// 2️⃣ Expected module names + required exports
// ---------------------------------------------------------------------------
const EXPECTED_EXPORTS = {
    cognitiveDriftIndex: ["calculateCognitiveDrift"],
    driftRecoveryPredictor: ["estimateDriftRecovery"],
    empathyWeights: ["getEmpathyWeights"],
    sentimentVectorizer: ["vectorizeSentiment"],
    personalityMatrix: ["getPersonalityProfile"],
    rewardAdaptiveLearning: ["updateRewardModel"],
    retailCognition: ["analyzeRetailTone"],
    investorSentiment: ["analyzeInvestorConfidence"],
    marketplaceAssist: ["assistNegotiation"],
};

// ---------------------------------------------------------------------------
// 3️⃣ Helper — safe import + validation
// ---------------------------------------------------------------------------
function safeLoadModule(filePath, expectedFns = []) {
    try {
        const mod = require(filePath);
        const name = path.basename(filePath, path.extname(filePath));
        const missing = expectedFns.filter(fn => typeof mod[fn] !== "function");

        if (missing.length === 0) {
            console.log(chalk.greenBright(`✅ Loaded ${name}`));
        } else {
            console.log(
                chalk.yellowBright(
                    `⚠️ ${name} loaded but missing exports: ${missing.join(", ")}`
                )
            );
        }
        return mod;
    } catch (err) {
        console.log(chalk.redBright(`❌ Failed to load ${filePath}: ${err.message}`));
        return {};
    }
}

// ---------------------------------------------------------------------------
// 4️⃣ Scan directory + load all known modules
// ---------------------------------------------------------------------------
const cognition = {};
for (const [baseName, exportsList] of Object.entries(EXPECTED_EXPORTS)) {
    const candidates = [
        path.join(COGNITIVE_PATH, `${baseName}.cjs`),
        path.join(COGNITIVE_PATH, `${baseName}.js`),
        path.join(COGNITIVE_PATH, baseName, "index.js"),
    ];
    const found = candidates.find(p => fs.existsSync(p));
    if (found) {
        cognition[baseName] = safeLoadModule(found, exportsList);
    } else {
        console.log(chalk.gray(`🔍 Skipped ${baseName} (file not found)`));
    }
}

// ---------------------------------------------------------------------------
// 5️⃣ Register globally so all modules share the same instance
// ---------------------------------------------------------------------------
global.AURA_TWINS = global.AURA_TWINS || {};
global.AURA_TWINS.cognition = cognition;
global.AURA_TWINS.startTime = new Date();

console.log(chalk.cyanBright("\n🧠 AURA Cognitive Bootstrap complete."));
console.log(
    chalk.gray(
        `Modules active: ${Object.keys(cognition)
            .filter(k => Object.keys(cognition[k]).length)
            .join(", ")}`
    )
);

// ---------------------------------------------------------------------------
// 6️⃣ Optional: Periodic health ping
// ---------------------------------------------------------------------------
setInterval(() => {
    const uptime = ((Date.now() - global.AURA_TWINS.startTime) / 1000).toFixed(1);
    console.log(
        chalk.magentaBright(
            `💫 AURA cognition alive | modules: ${Object.keys(global.AURA_TWINS.cognition).length
            } | uptime ${uptime}s`
        )
    );
}, 30000);
