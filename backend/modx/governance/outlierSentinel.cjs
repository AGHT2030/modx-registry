
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
//   • Detect high-impact governance or policy changes and issue proactive warnings
//   • Evaluate predicted risk to businesses via the Business Pulse dataset
//   • Communicate results to AURA Twins, CoinPurse dashboards, and admins
//
// Integrated with:
//   - daoEventWebhook.cjs
//   - aura-spectrum.js
//   - auraMetricsEmitter.js
//   - CoinPurse + BusinessPulse dashboards
//   - Twins Policy Advisor (twinsPolicyAdvisor.cjs)
//   - MODLINK Galaxy Event Bridge
//   - PQC Hybrid Signature Layer
//   - Admin AuditLog Engine (NEW)
//   - C5 Threat Engine (NEW forwarding hook)
// -----------------------------------------------------------------------------------------

/* ============================================================
   CJS IMPORTS + PQC WRAPPER + ROUTER
   ============================================================ */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const crypto = require("crypto");

// PQC hybrid layer (always signs, optionally verifies)
const {
    wrapSentinelOutput,
    verifySentinelOutput
} = require("../../aura/pqc-aura-layer.js");

// NEW: Audit Log Engine
const { auditLog } = require("../../admin/auditLogEngine");

// NEW: Optional C5 Threat Engine feed-through
let c5 = null;
try {
    c5 = require("./c5-threat-processor.cjs");
} catch {
    c5 = null;
}

// Launch-safe fallback PQC
const PQC = global.PQC || {
    sign: (d) => ({ integrity: "none", timestamp: Date.now() }),
    verify: () => true
};

// Strict PQC verification (OFF for launch, ON post-launch)
const STRICT_MODE = process.env.PQC_STRICT_MODE === "true";

/**
 * Trying to bind to the AURA Spectrum live socket
 */
let importedIo = null;
try {
    const auraSpectrum = require("../../modules/aura-spectrum.js");
    importedIo = auraSpectrum.io || null;
} catch (_) {
    importedIo = null;
}

/* ============================================================
   LOG PATHS
   ============================================================ */

const LOG_PATH = path.resolve("./backend/modx/governance/logs/outlier_risks.json");
const ADMIN_QUEUE_PATH = path.resolve("./backend/modx/governance/logs/admin_review_queue.json");

/* ============================================================
   CONFIG
   ============================================================ */

const impactThreshold = 0.7;
const severeThreshold = 0.85;
const cooldownMs = 30 * 60 * 1000; // 30 minutes
const lastWarnings = Object.create(null);

/* ============================================================
   SAFE JSON HELPERS
   ============================================================ */
function safeReadJson(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const raw = fs.readFileSync(filePath, "utf8");
        if (!raw.trim()) return fallback;
        return JSON.parse(raw);
    } catch (_) {
        return fallback;
    }
}

/* ============================================================
   PQC: Deterministic Anomaly Hash
   ============================================================ */
function anomalyHash(summary) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(summary))
        .digest("hex");
}

/* ============================================================
   CORE ENGINE FUNCTIONS
   ============================================================ */

// Placeholder ML until upgraded
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

// 🔍 Core evaluation + PQC hybrid signature
function evaluateImpact(rule, businesses) {
    let highImpactEntities = [];

    businesses.forEach((biz) => {
        const risk = simulateImpact(biz, rule);
        if (risk > impactThreshold) {
            highImpactEntities.push({
                id: biz.id,
                name: biz.name,
                sector: biz.sector,
                risk,
            });
        }
    });

    const ruleId =
        rule.ruleId ||
        rule.id ||
        rule.proposalId ||
        rule.hash ||
        "UNKNOWN_RULE";

    const summary = {
        ruleId,
        severity: rule.severity || "moderate",
        totalImpacted: highImpactEntities.length,
        topRisks: highImpactEntities.sort((a, b) => b.risk - a.risk).slice(0, 5),
        timestamp: new Date().toISOString(),

        // NEW: Attach originating chain
        chain: rule.chain || "unspecified",

        // NEW PQC anomaly hash
        anomalyHash: anomalyHash(rule)
    };

    // PQC SIGN (always)
    const signed = wrapSentinelOutput(summary);

    // STRICT VERIFY MODE
    if (STRICT_MODE) {
        const ok = verifySentinelOutput(signed);
        if (!ok) {
            console.error("❌ PQC verification failed — Sentinel evaluation REJECTED.");
            return null;
        }
    }

    // Only broadcast/log meaningful events
    if (summary.totalImpacted > 0) {
        logAndBroadcast(signed);
    }

    return signed;
}

/* ============================================================
   LOGGING + BROADCAST
   ============================================================ */

function logAndBroadcast(summary) {
    const { ruleId, severity, totalImpacted, chain } = summary;

    const score =
        totalImpacted > 10
            ? Math.min(1, 0.6 + totalImpacted / 100)
            : totalImpacted > 0
                ? 0.6
                : 0.2;

    // Cooldown
    const lastTs = lastWarnings[ruleId];
    if (lastTs && Date.now() - lastTs < cooldownMs) return;
    lastWarnings[ruleId] = Date.now();

    // Persist logs
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    const existing = safeReadJson(LOG_PATH, []);
    existing.push({ ...summary, score });
    fs.writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2));

    console.log(
        chalk.yellowBright(`⚠️ [AURA Outlier Sentinel] High-risk governance detected: ${ruleId}`)
    );

    /* -------------------------------------------------------
       NEW: SEC-grade audit record for the Sentinel event
    ------------------------------------------------------- */
    auditLog({
        severity: severity === "critical" ? "CRITICAL" : "HIGH",
        source: "AURA Outlier Sentinel",
        message: `High-risk governance impact detected for ${ruleId} (${chain})`,
        details: summary
    });

    /* -------------------------------------------------------
       NEW: Forward to C5 Threat Engine for cross-chain fusion
    ------------------------------------------------------- */
    if (c5 && c5.processC5) {
        try {
            c5.processC5({
                chain: chain,
                ruleId,
                severity,
                impact: totalImpacted,
                topRisks: summary.topRisks,
                sentinelScore: score
            });
        } catch (err) {
            console.error("⚠️ Failed to forward to C5:", err.message);
        }
    }

    // Socket dispatch
    const socket = global.auraIO || global.io || importedIo || null;

    if (socket) {
        socket.emit("business:pulse:warning", { ...summary, score });
        socket.emit("modx:policy:warning", { ...summary, score });
    }

    // Email Alerts
    if (process.env.MAIL_ALERTS === "true" && global.sendMail) {
        global.sendMail({
            subject: `⚠️ Governance Impact Warning: ${ruleId}`,
            text: `Severity: ${severity}\nTotal impacted: ${totalImpacted}`,
        });
    }

    // AURA Twins cognition pipeline
    try {
        if (global.AURA_TWINS?.cognition) {
            global.AURA_TWINS.cognition.lastImpact = { ...summary, score };
        }
    } catch (_) { }

    // CoinPurse inbox
    if (global.COINPURSE_PUSH_INBOX) {
        global.COINPURSE_PUSH_INBOX({
            type: "policy-update",
            title: ruleId,
            body: summary.topRisks?.[0]?.sector || "Policy update",
            severity,
        });
    }

    // MODX Galaxy broadcast
    if (global.MODX_GALAXY) {
        global.MODX_GALAXY.broadcast(
            "sentinel:policy:impact",
            Object.assign({}, summary, { score })
        );
    }
}

/* ============================================================
   WATCHER LOOP
   ============================================================ */

function startSentinelWatcher(intervalMs = 15000) {
    if (global.AURA_OUTLIER?.watcherActive) return;

    console.log("🛰️ AURA Outlier Sentinel active — monitoring governance queue…");

    global.AURA_OUTLIER = global.AURA_OUTLIER || {};
    global.AURA_OUTLIER.watcherActive = true;

    setInterval(() => {
        try {
            if (!fs.existsSync(ADMIN_QUEUE_PATH)) return;

            const queue = safeReadJson(ADMIN_QUEUE_PATH, []);
            if (!Array.isArray(queue) || queue.length === 0) return;

            queue
                .filter((q) => q && q.status === "pending_review")
                .forEach((rule) => {
                    const sampleBusinesses = [
                        { id: "1", name: "EcoTech Manufacturing", sector: "GreenTech", revenue: 2_500_000 },
                        { id: "2", name: "MODA Hotel Memphis", sector: "Hospitality", revenue: 1_800_000 },
                        { id: "3", name: "BLC Foundation", sector: "Nonprofit", revenue: 500_000 },
                        { id: "4", name: "AURA Labs", sector: "AIResearch", revenue: 3_500_000 },
                    ];

                    evaluateImpact(rule, sampleBusinesses);
                });
        } catch (err) {
            console.error("⚠️ Sentinel watcher error:", err.message);
        }
    }, intervalMs);
}

/* ============================================================
   INITIALIZER
   ============================================================ */

function initAURAOutlierSentinel(intervalMs) {
    console.log(chalk.magentaBright("🧩 AURA Outlier Sentinel (PQC Hybrid) initialized."));
    startSentinelWatcher(intervalMs || 15000);

    global.AURA_OUTLIER = Object.assign(global.AURA_OUTLIER || {}, {
        evaluateImpact,
        startSentinelWatcher,
    });
}

/* ============================================================
   ROUTER ENDPOINTS
   ============================================================ */

router.get("/health", (req, res) => {
    res.json({
        module: "AURA Outlier Sentinel (PQC Hybrid)",
        status: "online",
        watcherActive: !!(global.AURA_OUTLIER?.watcherActive),
        strictMode: STRICT_MODE,
        timestamp: new Date().toISOString(),
    });
});

router.post("/evaluate", (req, res) => {
    try {
        const { rule, businesses } = req.body || {};
        if (!rule || !Array.isArray(businesses))
            return res.status(400).json({ error: "Missing rule or businesses" });

        const summary = evaluateImpact(rule, businesses);

        const socket = global.auraIO || global.io || importedIo || null;
        if (socket) socket.emit("sentinel:evaluation:update", summary);

        if (global.MODX_GALAXY) {
            global.MODX_GALAXY.broadcast("sentinel:evaluation", summary);
        }

        if (global.POLICY_ADVISOR?.process) {
            global.POLICY_ADVISOR.process(summary);
        }

        res.json({ ok: true, summary });
    } catch (err) {
        res.status(500).json({ error: "Internal error" });
    }
});

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
    router,
    evaluateImpact,
    startSentinelWatcher,
    initAURAOutlierSentinel,
};
