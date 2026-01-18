
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

// © 2025 AIMAL Global Holdings | Policy Impact Advisor API
// Returns adaptive compliance recommendations based on DAO/Sentinel event data

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const DATA_PATH = path.resolve("backend/data/policy/recommendations.json");

// 🧠 Utility to load JSON safely
function loadRecommendations() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            console.warn(`⚠️ Recommendations file not found at ${DATA_PATH}`);
            return {};
        }
        const raw = fs.readFileSync(DATA_PATH, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("❌ Failed to load recommendations:", err);
        return {};
    }
}

/**
 * 🔍 Health check
 * GET /api/policy/advisor/health
 */
router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "Policy Advisor",
        timestamp: new Date().toISOString(),
    });
});

/**
 * 📘 GET /api/policy/advisor/recommendations
 * Query: ?policy=<policyName>
 */
router.get("/recommendations", async (req, res) => {
    const policyKey = (req.query.policy || "").trim();
    const data = loadRecommendations();

    if (!policyKey) {
        console.warn("⚠️ Missing 'policy' query parameter — returning default recommendations.");
        const fallback = data["default"] || [];
        return res.json({
            policy: "default",
            recommendations: fallback,
            source: "Policy Impact Advisor Engine",
            lastUpdated: new Date().toISOString(),
        });
    }

    const match =
        data[policyKey] ||
        data[policyKey.toLowerCase()] ||
        data[policyKey.toUpperCase()];

    if (!match) {
        console.warn(`⚠️ No recommendations found for ${policyKey}`);
        return res.status(404).json({
            policy: policyKey,
            recommendations: [],
            message: "No recommendations found for the requested policy.",
        });
    }

    // Attach metadata for frontend display
    const response = {
        policy: policyKey,
        recommendations: match,
        source: "Policy Impact Advisor Engine",
        lastUpdated: new Date().toISOString(),
    };

    console.log(`📡 Served Policy Advisor data for ${policyKey}`);
    res.json(response);
});

module.exports = router;
