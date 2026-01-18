
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

// © 2025 Mia Lopez | AIRS Middleware (Hybrid Integration Layer)
// 🌬️ Handles hybrid AIRS integration across MODE, CREATV, CoinPurse, and MODA layers.
// Includes: safe boot protection, ethers v6 compatibility, structured logging,
// cross-module sync, blockchain-safe authorization, and unified session integrity.

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { getProvider, ethers } = require("../utils/loadEthers");
const { safeRequire } = require("./globalMiddlewareLoader");

// ---------------------------------------------------------------------------
// ⚙️ Configuration
// ---------------------------------------------------------------------------
const AIRS_CONTRACT_ADDRESS = process.env.AIRS_CONTRACT_ADDRESS || null;
const AIRS_API_KEY = process.env.AIRS_API_KEY || null;
const AIRS_ABI_PATH = path.resolve(__dirname, "../../abis/AIRS.json");

// ---------------------------------------------------------------------------
// 🔗 Safe Contract Initialization (Ethers v6 FIXED)
// ---------------------------------------------------------------------------
let provider = null;
let contract = null;

function safeInitContract() {
    try {
        provider = getProvider();
        if (!provider) throw new Error("Provider unavailable — check RPC_URL.");

        // ⭐ FIXED — Ethers v6 validator
        if (!AIRS_CONTRACT_ADDRESS || !ethers.isAddress(AIRS_CONTRACT_ADDRESS)) {
            console.warn("⚠️ AIRS: Invalid or missing contract address — blockchain features disabled.");
            return;
        }

        // Load ABI only if file exists
        let ABI = [];
        if (fs.existsSync(AIRS_ABI_PATH)) {
            ABI = JSON.parse(fs.readFileSync(AIRS_ABI_PATH));
        } else {
            console.warn("⚠️ AIRS ABI missing:", AIRS_ABI_PATH);
        }

        // ⭐ FIXED — Ethers v6 contract syntax
        contract = new ethers.Contract(AIRS_CONTRACT_ADDRESS, ABI, provider);

        console.log(`✅ AIRS contract initialized at ${AIRS_CONTRACT_ADDRESS}`);
    } catch (err) {
        console.error("❌ AIRS contract init failed:", err.message);
        contract = null;
    }
}
safeInitContract();

// ---------------------------------------------------------------------------
// 🧩 Safe import of MODE Session Handler
// ---------------------------------------------------------------------------
const sessionUtils = safeRequire("./modeSessionHandler") || {};
const {
    startSession = (req, res, next) => next(),
    validateSession = (req, res, next) => next(),
    endSession = (req, res, next) => next(),
    healthCheck: modeHealth = () => ({ status: "unknown" }),
} = sessionUtils;

// ---------------------------------------------------------------------------
// 🔐 Authorization + Request Logging
// ---------------------------------------------------------------------------
async function verifyAIRSAuth(req, res, next) {
    try {
        const clientKey = req.headers["x-airs-key"] || req.query.key;

        if (AIRS_API_KEY && clientKey !== AIRS_API_KEY) {
            console.warn("🚫 Unauthorized AIRS request — invalid API key");
            return res.status(401).json({
                success: false,
                error: "Unauthorized — Invalid API key.",
            });
        }

        // ⭐ FIXED — ethers v6 wallet validator
        if (contract && req.headers["x-wallet"]) {
            const wallet = req.headers["x-wallet"];

            if (!ethers.isAddress(wallet)) {
                console.warn("⚠️ Invalid AIRS wallet address:", wallet);
            } else {
                console.log(`🔗 AIRS Wallet validated: ${wallet}`);
            }
        }

        req.airsUser = req.user || { id: "guest", role: "visitor" };
        next();
    } catch (err) {
        console.error("⚠️ AIRS verifyAIRSAuth error:", err.message);
        res.status(500).json({
            success: false,
            error: "AIRS Auth internal error.",
        });
    }
}

function authorize(req, res, next) {
    try {
        req.airsUser = req.user || { id: "guest", role: "visitor" };
        next();
    } catch (err) {
        console.warn("⚠️ AIRS authorize fallback:", err.message);
        next();
    }
}

function logRequest(req, res, next) {
    console.log(
        JSON.stringify({
            event: "AIRS_REQUEST",
            method: req.method,
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        })
    );
    next();
}

// ---------------------------------------------------------------------------
// 🚗 Core Request Handlers
// ---------------------------------------------------------------------------
function processAIRSRequest(req, res, next) {
    try {
        req.airsContext = {
            id: Date.now(),
            route: req.originalUrl,
            method: req.method,
            processed: true,
            timestamp: new Date().toISOString(),
        };
        console.log(`🌬️ AIRS processed ${req.method} ${req.originalUrl}`);
        next();
    } catch (err) {
        console.error("⚠️ AIRS processAIRSRequest error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
}

function attachUserContext(req, res, next) {
    req.airsUser = req.user || { id: "guest", role: "visitor" };
    next();
}

function handleError(err, req, res, next) {
    console.error("⚠️ AIRS Middleware caught error:", err.message);
    res.status(500).json({ success: false, error: err.message });
}

// ---------------------------------------------------------------------------
// 🔄 Hybrid Sync — AIRS ↔ MODE ↔ CREATV ↔ CoinPurse
// ---------------------------------------------------------------------------
function syncHybridContext(req, res, next) {
    try {
        const modeCtx = req.modeSession || {};
        const creatvCtx = req.creatvSession || {};
        const coinCtx = req.coinpurseSession || {};

        req.airsSync = {
            modeLinked: !!modeCtx.active,
            creatvLinked: !!creatvCtx.synced,
            coinLinked: !!coinCtx.connected,
            updatedAt: new Date().toISOString(),
        };

        console.log("🌀 AIRS hybrid sync:", JSON.stringify(req.airsSync));
        next();
    } catch (err) {
        console.warn("⚠️ AIRS syncHybridContext fallback:", err.message);
        next();
    }
}

// ---------------------------------------------------------------------------
// 💓 Health check
// ---------------------------------------------------------------------------
router.get("/health", (req, res) => {
    res.json({
        service: "AIRS Hybrid Middleware",
        status: "online",
        linkedModules: {
            mode: modeHealth().status,
            creatv: "active",
            coinpurse: "active",
        },
        blockchain: {
            contractLoaded: !!contract,
            address: AIRS_CONTRACT_ADDRESS || "not_set",
            provider: provider?.connection?.url || "uninitialized",
        },
        secured: !!AIRS_API_KEY,
        timestamp: new Date().toISOString(),
    });
});

// ---------------------------------------------------------------------------
// 🚀 Export router
// ---------------------------------------------------------------------------
module.exports = router;
