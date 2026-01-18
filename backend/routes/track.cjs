
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

// © 2025 AIMAL Global Holdings | Investor Link Tracker (CommonJS)
const express = require("express");
const jwt = require("jsonwebtoken");
const { appendLog } = require("../utils/accessLogger.cjs");

const router = express.Router();

// Helper: build a signed tracking URL for an investorId
// Example use: buildTrackingUrl("INVESTOR123")
function buildTrackingUrl(investorId, origin = "") {
    // `origin` is like https://airsnetwork.com (no trailing slash)
    const payload = { investorId };
    const token = jwt.sign(payload, process.env.INVESTOR_LINK_SECRET || "dev-secret", {
        expiresIn: "180d", // long-lived link
    });
    return `${origin}/track/aura?t=${encodeURIComponent(token)}`;
}

// GET /track/aura?t=<JWT>
router.get("/aura", (req, res) => {
    try {
        const { t } = req.query;
        if (!t) {
            return res.status(400).send("Missing token.");
        }
        const data = jwt.verify(t, process.env.INVESTOR_LINK_SECRET || "dev-secret");

        const logEntry = {
            event: "INVESTOR_DASHBOARD_OPEN",
            investorId: data.investorId || "unknown",
            ip: req.ip, // requires app.set('trust proxy', true) upstream
            userAgent: req.headers["user-agent"],
            referer: req.headers["referer"] || null,
            ts: new Date().toISOString(),
            path: req.originalUrl,
        };

        appendLog(logEntry).catch((e) => {
            console.error("Tracker log write failed:", e);
        });

        // Optional: also set a short-lived cookie to tag a session
        res.cookie("aura_inv", data.investorId, { httpOnly: true, sameSite: "Lax", maxAge: 1000 * 60 * 60 * 24 * 7 });

        // Redirect to the live dashboard
        return res.redirect("/aura/dashboard");
    } catch (err) {
        console.error("Tracker token error:", err.message);
        return res.status(400).send("Invalid or expired tracking token.");
    }
});

module.exports = { router, buildTrackingUrl };
