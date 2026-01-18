
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

// © 2025 Mia Lopez | MODX Ecosystem Analytics Endpoints
// Serves trend + insight data to AIRS, CoinPurse, and MODA dashboards

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ------------------------------------------------------
// 🧭 Directory Configuration
// ------------------------------------------------------
const ROOT = process.cwd();
const ANALYTICS_DIR = path.join(ROOT, "analytics");
const MRI_DIR = path.join(ANALYTICS_DIR, "mri");
const TWINS_DIR = path.join(ANALYTICS_DIR, "twins");
const LOG_FILE = path.join(MRI_DIR, "metrics.log");

// Ensure folders exist
for (const dir of [ANALYTICS_DIR, MRI_DIR, TWINS_DIR, path.dirname(LOG_FILE)]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ------------------------------------------------------
// 🔹 Utility Functions
// ------------------------------------------------------
function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, line);
    } catch {
        console.warn("⚠️ Unable to write analytics log file.");
    }
    console.log(msg);
}

function safeRead(filePath, fallback = {}) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        log(`⚠️ Failed to read ${filePath}: ${err.message}`);
        return fallback;
    }
}

// ------------------------------------------------------
// 📊 GET /api/analytics/trends
// Provides Retail + CoinPurse + Route activity trends
// ------------------------------------------------------
router.get("/trends", (req, res) => {
    const trendPath = path.join(MRI_DIR, "trendReport.json");
    const data = safeRead(trendPath, {
        topProducts: [],
        topWallets: [],
        routeSummary: [],
        airsSummary: [],
        sustainability: [],
    });

    res.status(200).json({
        status: "ok",
        source: "trendReport",
        updated: new Date().toISOString(),
        metrics: {
            totalProducts: data.topProducts?.length || 0,
            totalWallets: data.topWallets?.length || 0,
            totalRoutes: data.routeSummary?.length || 0,
        },
        data,
    });
});

// ------------------------------------------------------
// 🧠 GET /api/analytics/insights
// Unified AI insights for Twins, dashboards, & CoinPurse AI layer
// ------------------------------------------------------
router.get("/insights", (req, res) => {
    const insightPath = path.join(TWINS_DIR, "insights.json");
    const data = safeRead(insightPath, {
        highlights: {},
        ai_recommendations: [],
        domains: {
            Retail: [],
            Wallet: [],
            AIRS: [],
            Sustainability: [],
        },
    });

    const insightCount =
        (data.domains?.Retail?.length || 0) +
        (data.domains?.Wallet?.length || 0) +
        (data.domains?.AIRS?.length || 0) +
        (data.domains?.Sustainability?.length || 0);

    res.status(200).json({
        status: "ok",
        source: "insightsReport",
        updated: new Date().toISOString(),
        insightsCount: insightCount,
        data,
    });
});

// ------------------------------------------------------
// 🧩 GET /api/analytics/summary
// Combines highlights from both trend & insight reports
// ------------------------------------------------------
router.get("/summary", (req, res) => {
    const trends = safeRead(path.join(MRI_DIR, "trendReport.json"));
    const insights = safeRead(path.join(TWINS_DIR, "insights.json"));

    const summary = {
        generated_at: new Date().toISOString(),
        totalDomains: Object.keys(insights?.domains || {}).length,
        totalInsights: insights?.summary?.totalInsights || 0,
        totalResidencies: insights?.active_residencies?.length || 0,
        highlights: {
            bestProduct: trends?.topProducts?.[0]?.product || "N/A",
            bestWallet: trends?.topWallets?.[0]?.wallet_address || "N/A",
            topAIRS: trends?.airsSummary?.[0]?.service || "N/A",
            sustainabilityFocus:
                trends?.sustainability?.[0]?.category || "Sustainable Design",
        },
    };

    res.status(200).json({
        status: "ok",
        source: "analyticsSummary",
        updated: new Date().toISOString(),
        summary,
    });
});

// ------------------------------------------------------
// ⚙️ GET /api/analytics/health
// Simple readiness probe for monitoring
// ------------------------------------------------------
router.get("/health", (req, res) => {
    const trendFile = fs.existsSync(path.join(MRI_DIR, "trendReport.json"));
    const insightFile = fs.existsSync(path.join(TWINS_DIR, "insights.json"));
    res.status(200).json({
        status: "online",
        timestamp: new Date().toISOString(),
        components: {
            trendReport: trendFile ? "ok" : "missing",
            insightsReport: insightFile ? "ok" : "missing",
        },
    });
});

module.exports = router;
