
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

// © 2025 AIMAL Global Holdings | AURA Policy Route
// -----------------------------------------------------------------------------
// Purpose:
//   Provides API endpoints for AI-driven policy analysis, governance insights,
//   and adaptive mitigation recommendations for CoinPurse and MODX dashboards.
//
// Integrated with:
//   - Outlier Sentinel
//   - AURA Twins (Ari & Agador)
//   - Policy Advisor Engine
//   - Universe Gateway (via Galaxy registration)
// -----------------------------------------------------------------------------

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { registerGalaxy } = require("../../galaxy-register");

const router = express.Router();

// 🧩 Local middleware stack
router.use(express.json());
router.use(cors());
router.use(morgan("dev"));

// Paths
const POLICY_LOG = path.resolve("./backend/modx/governance/logs/policy_advisories.json");

// -----------------------------------------------------------------------------
// 🔍 ABI Presence Verifier — PulseNFT + MODAStayHybrid
// -----------------------------------------------------------------------------
function verifyABIStatus() {
    const abis = {
        PulseNFT: path.resolve("./backend/abis/PulseNFT.json"),
        MODAStayHybrid: path.resolve("./backend/abis/MODAStayHybrid.json"),
    };
    const result = {};

    for (const [name, abiPath] of Object.entries(abis)) {
        try {
            if (fs.existsSync(abiPath)) {
                const content = fs.readFileSync(abiPath, "utf8");
                JSON.parse(content);
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

// ----------------------------------------------------------------------------
// 🔧 Utility: log and store advisory data
// ----------------------------------------------------------------------------
function logPolicyAdvisory(data) {
    try {
        fs.mkdirSync(path.dirname(POLICY_LOG), { recursive: true });
        const existing = fs.existsSync(POLICY_LOG)
            ? JSON.parse(fs.readFileSync(POLICY_LOG, "utf8"))
            : [];
        existing.push(data);
        fs.writeFileSync(POLICY_LOG, JSON.stringify(existing, null, 2));
    } catch (err) {
        console.warn("⚠️ Failed to write policy advisory log:", err.message);
    }
}

// ----------------------------------------------------------------------------
// 🧩 Live advisory generator (from global AURA layer if active)
// ----------------------------------------------------------------------------
function generateAdvisory(rule) {
    const advisory = {
        ruleId: rule.id || rule.ruleId,
        severity: rule.severity || "moderate",
        recommendation:
            rule.severity === "critical"
                ? "Immediate executive review required. Trigger fallback governance protocol."
                : rule.severity === "high"
                    ? "Prepare mitigation briefing and schedule AURA audit review."
                    : "Monitor under standard compliance cadence.",
        impactEstimate: Math.random().toFixed(2),
        createdAt: new Date().toISOString(),
    };

    logPolicyAdvisory(advisory);
    return advisory;
}

// ----------------------------------------------------------------------------
// 🚀 Initialize Policy Advisor memory link (global-safe)
// ----------------------------------------------------------------------------
function initAURAPolicyAdvisor() {
    console.log(chalk.greenBright("📘 AURA Policy Advisor route initialized."));
    global.AURA_POLICY = {
        generateAdvisory,
    };
}

if (!global.AURA_POLICY) initAURAPolicyAdvisor();

// ----------------------------------------------------------------------------
// 🧭 Routes
// ----------------------------------------------------------------------------

// Health check for dashboards — includes ABI verifier
router.get("/health", (req, res) => {
    const abiStatus = verifyABIStatus();
    res.json({
        module: "AURA Policy Advisor",
        status: "online",
        initialized: !!global.AURA_POLICY,
        abiStatus,
        timestamp: new Date().toISOString(),
    });
});

// Evaluate a rule or event for advisory generation
router.post("/advisory", (req, res) => {
    try {
        const { rule } = req.body || {};
        if (!rule) {
            return res.status(400).json({ error: "Missing rule payload" });
        }

        const advisory = generateAdvisory(rule);

        // Broadcast to dashboards or Sentinel listeners
        if (global.io) {
            global.io.emit("policy:advisory:update", advisory);
        }

        console.log(chalk.blueBright(`💡 Policy advisory generated for rule: ${rule.id}`));
        res.json({ ok: true, advisory });
    } catch (err) {
        console.error("❌ Policy advisory generation failed:", err.message);
        res.status(500).json({ error: "Internal error" });
    }
});

// Retrieve all logged advisories
router.get("/history", (req, res) => {
    try {
        if (!fs.existsSync(POLICY_LOG)) return res.json([]);
        const data = JSON.parse(fs.readFileSync(POLICY_LOG, "utf8"));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Unable to read advisory log" });
    }
});

// 🌌 Register Policy Galaxy with Universe Gateway
if (process.env.COINPURSE_PORT) {
    const port = process.env.COINPURSE_PORT || 8083;
    registerGalaxy({ name: "policy", port });
    console.log(`📡 AURA Policy Galaxy registered via router (port ${port})`);
}

// ✅ Export router for server.js mount
module.exports = router;
