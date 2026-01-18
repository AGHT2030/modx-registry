
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

// © 2025 AIMAL Global Holdings | AURA Outlier Sentinel (Governance + Business Pulse Layer)
// -----------------------------------------------------------------------------------------
// Purpose:
//   Detects high-impact governance or policy changes and issue proactive warnings.
//   Evaluates predicted risk to businesses via the Business Pulse dataset.
//   Communicates results to AURA Twins, CoinPurse dashboards, and admins.
//
// Integrated with:
//   - daoEventWebhook.cjs (policy finalization events)
//   - aura-spectrum.js (Socket.IO stream)
//   - auraMetricsEmitter.js (AI twins & sentiment metrics)
//   - CoinPurse + BusinessPulse dashboards
//   - Sentinel API Router (this file)
//   - Twins Policy Advisor (adaptive recommendations)
//   - DAO → Galaxy Event Bridge (MODLINK Universe updates)
// -----------------------------------------------------------------------------------------

const express = require("express");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const cors = require("cors");
const morgan = require("morgan");

// Optional Galaxy registration
let registerGalaxy = () => { };
try {
    ({ registerGalaxy } = require("../../galaxy-register"));
} catch (_) { }

// -----------------------------------------------------------------------------------------
// Router Initialization
// -----------------------------------------------------------------------------------------
const router = express.Router();

router.use(express.json());
router.use(cors());
router.use(morgan("dev"));

// -----------------------------------------------------------------------------------------
// Log paths
// -----------------------------------------------------------------------------------------
const LOG_PATH = path.resolve("./backend/modx/governance/logs/outlier_risks.json");
const ADMIN_QUEUE_PATH = path.resolve("./backend/modx/governance/logs/admin_review_queue.json");

// -----------------------------------------------------------------------------------------
// Config thresholds
// -----------------------------------------------------------------------------------------
const impactThreshold = 0.7;
const severeThreshold = 0.85;
const warningLeadTime = 168;
const cooldownMs = 30 * 60 * 1000;

let lastWarnings = {};

// -----------------------------------------------------------------------------------------
// 🔍 ABI Presence Verifier — PulseNFT + MODAStayHybrid
// -----------------------------------------------------------------------------------------
function verifyABIStatus() {
    const abis = {
        PulseNFT: path.resolve("./backend/abis/PulseNFT.json"),
        MODAStayHybrid: path.resolve("./backend/abis/MODAStayHybrid.json"),
    };
    const result = {};

    for (const [name, abiPath] of Object.entries(abis)) {
        try {
            if (fs.existsSync(abiPath)) {
                JSON.parse(fs.readFileSync(abiPath, "utf8"));
                result[name] = "✅ Found and valid";
            } else {
                result[name] = "⚠️ Missing";
            }
        } catch (err) {
            result[name] = `❌ Invalid JSON: ${err.message}`;
        }
    }
    return result;
}

// -----------------------------------------------------------------------------------------
// 🧠 Simulated impact prediction
// -----------------------------------------------------------------------------------------
function simulateImpact(biz, rule) {
    const base = Math.random() * 0.4 + 0.3;
    const governanceFactor =
        rule.severity === "critical"
            ? 0.9
            : rule.severity === "high"
                ? 0.75
                : 0.5;
    const sizeWeight = Math.min(biz.revenue / 1_000_000, 2);
    return Math.min(base * governanceFactor * sizeWeight, 1);
}

// -----------------------------------------------------------------------------------------
// 🔍 Core evaluation
// -----------------------------------------------------------------------------------------
function evaluateImpact(rule, businesses) {
    const highImpactEntities = [];

    (businesses || []).forEach((biz) => {
        const risk = simulateImpact(biz, rule);
        if (risk > impactThreshold) {
            highImpactEntities.push({
                id: biz.id,
                name: biz.name,
                sector: biz.sector,
                revenue: biz.revenue,
                risk,
            });
        }
    });

    if (highImpactEntities.length > 0) {
        const summary = {
            ruleId: rule.id || rule.ruleId,
            severity: rule.severity || "moderate",
            totalImpacted: highImpactEntities.length,
            topRisks: highImpactEntities
                .sort((a, b) => b.risk - a.risk)
                .slice(0, 5),
            timestamp: new Date().toISOString(),
        };
        logAndBroadcast(summary);

        // 🚀 NEW: also notify Policy Advisor
        if (global.POLICY_ADVISOR) {
            try {
                global.POLICY_ADVISOR.process(summary);
            } catch (err) {
                console.warn("⚠️ Failed to pipeline to POLICY_ADVISOR:", err.message);
            }
        }

        return summary;
    }

    return {
        ruleId: rule.id || rule.ruleId,
        severity: rule.severity || "moderate",
        totalImpacted: 0,
    };
}

// -----------------------------------------------------------------------------------------
// 💾 Logging + Global Broadcast
// -----------------------------------------------------------------------------------------
function logAndBroadcast(summary) {
    const { ruleId, severity, totalImpacted } = summary;

    const score =
        totalImpacted > 10
            ? Math.min(1, 0.6 + totalImpacted / 100)
            : totalImpacted > 0
                ? 0.6
                : 0.2;

    // Cooldown
    const last = lastWarnings[ruleId];
    if (last && Date.now() - last < cooldownMs) return;
    lastWarnings[ruleId] = Date.now();

    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    const existing = fs.existsSync(LOG_PATH)
        ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8"))
        : [];
    existing.push({ ...summary, score });
    fs.writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2));

    console.log(
        chalk.yellowBright(`⚠️ [AURA Outlier Sentinel] High-risk governance detected: ${ruleId}`)
    );
    console.log(
        chalk.gray(`   Severity: ${severity} | Businesses affected: ${totalImpacted}`)
    );

    // Dashboard push
    const io = global.io || null;
    if (io) {
        io.emit("business:pulse:warning", { ...summary, score });
        io.emit("modx:policy:warning", { ...summary, score });
        io.emit("sentinel:evaluation:update", summary);
    }

    // Email
    if (process.env.MAIL_ALERTS === "true" && global.sendMail) {
        global.sendMail({
            subject: `⚠️ Governance Impact Warning: ${ruleId}`,
            text: `Severity: ${severity}\nAffected: ${totalImpacted}`,
        });
    }

    // AURA Twins sync
    try {
        if (global.AURA_TWINS?.cognition) {
            global.AURA_TWINS.cognition.lastImpact = summary;
            console.log(
                chalk.cyanBright("🧠 AURA Twins: Business Pulse data absorbed.")
            );
        }
    } catch (err) {
        console.warn("⚠️ Could not update AURA Twins:", err.message);
    }

    // CoinPurse Inbox push
    if (global.COINPURSE_PUSH_INBOX) {
        global.COINPURSE_PUSH_INBOX({
            type: "policy-update",
            title: ruleId,
            body: "New governance activity detected",
            severity: severity,
        });
    }

    // 🚀 NEW: DAO → Galaxy event bridge
    try {
        if (global.MODX_GALAXY) {
            global.MODX_GALAXY.broadcast("sentinel:policy:impact", summary);
        }
    } catch (err) {
        console.warn("⚠️ MODX_GALAXY bridge failed:", err.message);
    }
}

// -----------------------------------------------------------------------------------------
// 🛰️ Watcher Loop
// -----------------------------------------------------------------------------------------
function startSentinelWatcher(intervalMs = 15000) {
    console.log("🛰️ AURA Outlier Sentinel active — monitoring governance queue…");

    setInterval(() => {
        try {
            if (fs.existsSync(ADMIN_QUEUE_PATH)) {
                const queue = JSON.parse(fs.readFileSync(ADMIN_QUEUE_PATH, "utf8"));

                queue
                    .filter((q) => q.status === "pending_review")
                    .forEach((rule) => {
                        const sampleBusinesses = [
                            { id: "1", name: "EcoTech Manufacturing", sector: "GreenTech", revenue: 2_500_000 },
                            { id: "2", name: "MODA Hotel Memphis", sector: "Hospitality", revenue: 1_800_000 },
                            { id: "3", name: "BLC Foundation", sector: "Nonprofit", revenue: 500_000 },
                            { id: "4", name: "AURA Labs", sector: "AI Research", revenue: 3_500_000 },
                        ];
                        evaluateImpact(rule, sampleBusinesses);
                    });
            }
        } catch (err) {
            console.error("⚠️ Sentinel watcher error:", err.message);
        }
    }, intervalMs);
}

// -----------------------------------------------------------------------------------------
// Initialization (global-safe)
// -----------------------------------------------------------------------------------------
function initAURAOutlierSentinel() {
    console.log(chalk.magentaBright("🧩 AURA Outlier Sentinel initialized."));
    startSentinelWatcher();
    global.AURA_OUTLIER = { evaluateImpact, startSentinelWatcher };
}

if (!global.AURA_OUTLIER) {
    try {
        initAURAOutlierSentinel();
    } catch (err) {
        console.warn("⚠️ Failed to init AURA Outlier Sentinel:", err.message);
    }
}

// -----------------------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------------------
router.get("/health", (req, res) => {
    const abiStatus = verifyABIStatus();
    res.json({
        module: "AURA Outlier Sentinel",
        status: "online",
        watcherActive: !!global.AURA_OUTLIER,
        abiStatus,
        timestamp: new Date().toISOString(),
    });
});

router.get("/status", (req, res) => {
    res.json({
        module: "AURA Outlier Sentinel",
        watcherActive: !!global.AURA_OUTLIER,
        cooldownMs,
        lastWarningsKeys: Object.keys(lastWarnings).length,
        timestamp: new Date().toISOString(),
    });
});

router.get("/abi", (req, res) => {
    res.json({ abiStatus: verifyABIStatus(), timestamp: new Date().toISOString() });
});

router.post("/evaluate", (req, res) => {
    try {
        const { rule, businesses } = req.body || {};
        if (!rule || !Array.isArray(businesses)) {
            return res.status(400).json({ error: "Missing rule or businesses array" });
        }
        const summary = evaluateImpact(rule, businesses);

        console.log(
            chalk.yellowBright("📊 AURA Sentinel evaluation complete via /evaluate.")
        );

        if (global.io) global.io.emit("sentinel:evaluation:update", summary);

        // 🚀 NEW: policy advisor sync
        if (global.POLICY_ADVISOR) {
            global.POLICY_ADVISOR.process(summary);
        }

        // 🚀 NEW: Galaxy broadcast
        if (global.MODX_GALAXY) {
            global.MODX_GALAXY.broadcast("sentinel:evaluation", summary);
        }

        res.json({ ok: true, summary });
    } catch (err) {
        console.error("❌ Sentinel evaluate error:", err.message);
        res.status(500).json({ error: "Internal error" });
    }
});

router.get("/logs", (req, res) => {
    try {
        if (!fs.existsSync(LOG_PATH)) return res.json([]);
        const data = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
        res.json(data);
    } catch (err) {
        console.error("⚠️ Unable to read Sentinel logs:", err.message);
        res.status(500).json({ error: "Unable to read Sentinel logs" });
    }
});

router.post("/queue/enqueue", (req, res) => {
    try {
        const { rule } = req.body || {};
        if (!rule) return res.status(400).json({ error: "Missing rule payload" });

        fs.mkdirSync(path.dirname(ADMIN_QUEUE_PATH), { recursive: true });
        const q = fs.existsSync(ADMIN_QUEUE_PATH)
            ? JSON.parse(fs.readFileSync(ADMIN_QUEUE_PATH, "utf8"))
            : [];
        q.push({
            ...rule,
            status: rule.status || "pending_review",
            enqueuedAt: new Date().toISOString(),
        });
        fs.writeFileSync(ADMIN_QUEUE_PATH, JSON.stringify(q, null, 2));

        res.json({ ok: true, size: q.length });
    } catch (err) {
        res.status(500).json({ error: "Unable to enqueue rule" });
    }
});

router.post("/queue/clear", (req, res) => {
    try {
        fs.mkdirSync(path.dirname(ADMIN_QUEUE_PATH), { recursive: true });
        fs.writeFileSync(ADMIN_QUEUE_PATH, JSON.stringify([], null, 2));
        res.json({ ok: true, cleared: true });
    } catch (err) {
        res.status(500).json({ error: "Unable to clear queue" });
    }
});

// -----------------------------------------------------------------------------------------
// 🌌 Register Sentinel Galaxy
// -----------------------------------------------------------------------------------------
try {
    const assumedPort =
        process.env.SENTINEL_PORT ||
        process.env.API_PORT ||
        process.env.COINPURSE_PORT ||
        8083;

    registerGalaxy({ name: "sentinel", port: Number(assumedPort) });
    console.log(`📡 AURA Sentinel Galaxy registered via router (port ${assumedPort})`);
} catch (err) {
    console.log("ℹ️ Galaxy registration skipped (not available):", err.message);
}

// -----------------------------------------------------------------------------------------
// Export router (multiple shapes to prevent mis-mounting in server.js)
// -----------------------------------------------------------------------------------------
module.exports = router;
module.exports.router = router;
module.exports.default = router;
