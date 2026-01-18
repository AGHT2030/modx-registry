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

// © 2025 AIMAL Global Holdings | INVEST Galaxy (Authoritative Runtime)

"use strict";

const express = require("express");
const app = express();

const investIntakeRoute = require("../routes/investment/intake.cjs");
const executeEscalationRoute = require("../routes/investment/executeEscalation.cjs");
const trusteeDecisionRoute = require("../trustee/routes/decisions.cjs");


/* ------------------------------------------------------------------
 * 🔒 FIRST BYTE GOVERNANCE GATE (DENY BEFORE LOAD)
 * ------------------------------------------------------------------
 * No INVEST logic, intake, or side-effects are allowed to initialize
 * unless a MODLINK proof is present.
 * This protects against:
 *  - accidental exposure
 *  - test harness leakage
 *  - future route expansion errors
 * ------------------------------------------------------------------ */
app.use(express.json({ limit: "2mb" }));
app.use(investIntakeRoute);
app.use(executeEscalationRoute);
app.use(trusteeDecisionRoute);

app.use((req, res, next) => {
    // Allow galaxy-level health checks without governance
    if (req.path === "/health" || req.path === "/api/investment/health") {
        return next();
    }

    if (!req.headers["x-modlink-proof"]) {
        return res.status(403).json({
            error: "GOVERNANCE_DENIED",
            reason: "DENY_MISSING_MODLINK_PROOF",
        });
    }

    next();
});

/* ------------------------------------------------------------------
 * 🔐 MODLINK VERIFIER (LOADED ONLY AFTER PROOF EXISTS)
 * ------------------------------------------------------------------ */
const { requireModlinkProof } = require("../mode/middleware/requireModlinkProof.cjs");

/* ------------------------------------------------------------------
 * 🔹 INVESTMENT INTAKE ROUTES (GOVERNED)
 * ------------------------------------------------------------------
 * All INVEST actions are governed:
 *  - intake
 *  - trade
 *  - settlement
 *  - future issuance hooks
 * ------------------------------------------------------------------ */
const investmentIntakeRoutes = require("../routes/investment/intake-route.cjs");

/* ------------------------------------------------------------------
 * 🔗 ROUTE MOUNT (GOVERNANCE-FIRST)
 * ------------------------------------------------------------------ */
app.use(
    "/api/investment",
    requireModlinkProof("INVEST_INTAKE"),
    investmentIntakeRoutes
);

/* ------------------------------------------------------------------
 * 🩺 HEALTH CHECK (GALAXY LEVEL — SAFE)
 * ------------------------------------------------------------------ */
app.get("/health", (_req, res) => {
    res.status(200).json({
        service: "INVEST",
        status: "online",
        governance: "MODLINK_REQUIRED",
        time: new Date().toISOString(),
    });
});

/* ------------------------------------------------------------------
 * 🚀 START SERVER (WSL / DOCKER SAFE)
 * ------------------------------------------------------------------ */
const PORT = process.env.INVEST_PORT || 8088;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🟢 INVEST galaxy online on ${PORT}`);
});
