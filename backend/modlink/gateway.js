
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

// © 2025 AIMAL Global Holdings | MODLINK Gateway Wrapper
// Central router enforcing DAO policies, routing verified traffic, 
// and governing all modules (Health, Events, Play, Invest, etc.)

const express = require("express");
const router = express.Router();
const logger = require("../../logger");
const { registry } = require("./registry");
const { validateDAO } = require("./dao");        // ✅ new DAO validator
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load Vault helper
const loadVault = require("./vault");

// Load DAO policy maps (fallback to defaults)
const policyMapPath = path.join(__dirname, "policies", "daoPolicyMap.json");
let policyMap = {};
try {
    policyMap = JSON.parse(fs.readFileSync(policyMapPath, "utf8"));
} catch {
    logger?.warn("⚠️ No daoPolicyMap.json found; using default policy map.");
    policyMap = {
        HealthDAO: { policies: ["HIPAA", "Consent"], requiredScopes: ["health:read"] },
        EventsDAO: { policies: ["VerifiedPartner"], requiredScopes: ["events:read"] },
        EntertainmentDAO: { policies: ["AgeCheck"], requiredScopes: ["media:read"] },
        HospitalityDAO: { policies: ["GuestAccess"], requiredScopes: ["stay:read"] },
        FinanceDAO: { policies: ["KYC", "AML"], requiredScopes: ["finance:trade"] },
    };
}

/* --------------------------------------------------------------
   🧱 Primary Middleware — Token & Policy Enforcement Layer
-------------------------------------------------------------- */
router.use(async (req, res, next) => {
    try {
        const modlink = req.modlink || {};
        const tokenData = modlink.tokenPayload || {};
        const dao = tokenData.dao || "PublicDAO";
        const daoPolicy = policyMap[dao] || {};

        // Validate DAO compliance using index loader
        const daoCheck = validateDAO(dao, req.body || {});
        if (!daoCheck.ok) {
            logger?.warn(`🚫 DAO Validation failed for ${dao}: ${daoCheck.reason}`);
            return res.status(403).json({ error: `DAO validation failed`, dao, reason: daoCheck.reason });
        }

        // Verify JWT scopes
        if (daoPolicy.requiredScopes?.length && tokenData.scopes) {
            const missing = daoPolicy.requiredScopes.filter(
                (scope) => !tokenData.scopes.includes(scope)
            );
            if (missing.length) {
                logger?.warn(`🚫 Scope fail for ${dao}: missing ${missing.join(",")}`);
                return res.status(403).json({
                    error: `Insufficient token scopes`,
                    missing,
                });
            }
        }

        // Inject vault for secure secrets
        req.modlink = req.modlink || {};
        req.modlink.vault = req.modlink.vault || loadVault();

        next();
    } catch (err) {
        logger?.error("MODLINK gateway token/policy error:", err);
        return res.status(401).json({ error: "MODLINK authorization failed" });
    }
});

/* --------------------------------------------------------------
   🧭 Dynamic Module Router — Verifies & Directs Requests
-------------------------------------------------------------- */
router.all("/:module/:endpoint", async (req, res) => {
    try {
        const { module, endpoint } = req.params;
        const targetModule = module.toUpperCase();
        const entry = registry[targetModule];

        if (!entry) {
            return res.status(404).json({ error: `Unknown MODLINK module: ${targetModule}` });
        }

        // DAO Validation for this module
        const daoCheck = validateDAO(entry.dao, req.body);
        if (!daoCheck.ok) {
            return res.status(403).json({
                error: "DAO policy violation",
                dao: entry.dao,
                reason: daoCheck.reason,
            });
        }

        const user = req.modlink?.tokenPayload?.sub || "anonymous";
        const payload = {
            user,
            body: req.body || {},
            query: req.query || {},
            headers: req.headers,
            vault: req.modlink?.vault,
            endpoint,
        };

        // 🏦 Investor & Finance DAO Hardening
        if (["INVEST", "FINANCE"].includes(targetModule) || /invest/i.test(module)) {
            const { address, chain } = payload.body;
            if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address))
                return res.status(400).json({ error: "Invalid wallet address" });

            const hasKYC = req.modlink?.tokenPayload?.kycVerified === true;
            if (!hasKYC) return res.status(403).json({ error: "KYC verification required" });

            // HMAC Signature Verification (to prevent tampering)
            const bodyString = JSON.stringify(req.body);
            const signature = req.headers["x-modlink-signature"];
            const secretKey = process.env.MODLINK_HMAC_SECRET || "dev-secret";
            const computed = crypto
                .createHmac("sha256", secretKey)
                .update(bodyString)
                .digest("hex");

            if (signature !== computed) {
                logger?.warn("🚫 Invalid HMAC signature on investor request");
                return res.status(403).json({ error: "Invalid HMAC signature" });
            }
        }

        // Route to Express handler or direct function
        const handler = entry.route;
        if (typeof handler === "function") return handler(req, res);

        const moduleFn = require(`../routes/${module.toLowerCase()}`);
        if (moduleFn && typeof moduleFn[endpoint] === "function") {
            const result = await moduleFn[endpoint](payload);
            return res.json({ status: "ok", module, endpoint, result });
        }

        return res.status(501).json({ error: `Module ${module} has no endpoint ${endpoint}` });
    } catch (err) {
        logger?.error("MODLINK Gateway routing error:", err);
        return res.status(500).json({ error: "Gateway routing failure" });
    }
});

/* --------------------------------------------------------------
   🔒 Secure Investment Operations (MODUSD / INTI Wrappers)
-------------------------------------------------------------- */
router.post("/invest/wrap", async (req, res) => {
    try {
        const { address, amount, tokenType } = req.body;
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address))
            return res.status(400).json({ error: "Invalid address" });
        if (!amount || amount <= 0)
            return res.status(400).json({ error: "Invalid amount" });

        const txHash = "0x" + crypto.randomBytes(16).toString("hex");
        logger?.info(`MODLINK wrap ${tokenType || "MODUSD"} ${amount} for ${address}`);
        res.json({ status: "ok", txHash });
    } catch (err) {
        logger?.error("Invest wrap error:", err);
        res.status(500).json({ error: "Investment wrap failed" });
    }
});

router.post("/invest/unwrap", async (req, res) => {
    try {
        const { address, amount, tokenType } = req.body;
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address))
            return res.status(400).json({ error: "Invalid address" });
        if (!amount || amount <= 0)
            return res.status(400).json({ error: "Invalid amount" });

        const txHash = "0x" + crypto.randomBytes(16).toString("hex");
        logger?.info(`MODLINK unwrap ${tokenType || "INTI"} ${amount} for ${address}`);
        res.json({ status: "ok", txHash });
    } catch (err) {
        logger?.error("Invest unwrap error:", err);
        res.status(500).json({ error: "Investment unwrap failed" });
    }
});

/* --------------------------------------------------------------
   🧠 Health Check & Diagnostics
-------------------------------------------------------------- */
router.get("/status", (req, res) => {
    res.json({
        status: "✅ MODLINK Gateway active",
        timestamp: new Date().toISOString(),
        modules: Object.keys(registry),
    });
});

module.exports = router;
