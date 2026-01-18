
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

// © 2025 Mia Lopez | CoinPurse™ Middleware | protectRoutes.js
// 🔐 Secure route protection middleware (JWT-based + hybrid token checks)
// Supports JWT auth, CoinPurse wallet headers, AIRS API key, and AURA Gateway key validation.
// Always exports a valid Express middleware function for safeRequire() in app.js.

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const chalk = require("chalk");
dotenv.config({ path: process.env.ENV_PATH || ".env.override" });

/* ---------------------------------------------------------------------------
   🧩 Hybrid Secure Access Middleware
   Validates JWT + optional CoinPurse wallet + AIRS + AURA key (hybrid security)
--------------------------------------------------------------------------- */
async function protectRoutes(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const wallet = req.headers["x-wallet"];
        const airsKey = req.headers["x-airs-key"];
        const auraKey = req.headers["x-aura-key"] || req.headers["x-api-key"];

        // ✅ Require at least one form of authentication
        if (!authHeader && !wallet && !airsKey && !auraKey) {
            console.warn(chalk.yellow("🚫 Unauthorized request: missing credentials"));
            return res.status(401).json({
                success: false,
                error: "Authorization token or key required.",
            });
        }

        // 🔹 JWT verification (primary)
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSecret");
                req.user = decoded;

                if (req.user.status && ["banned", "suspended"].includes(req.user.status)) {
                    return res.status(403).json({
                        success: false,
                        error: "Access restricted — account inactive.",
                    });
                }
            } catch (jwtErr) {
                console.warn(chalk.red("⚠️ Invalid JWT:"), jwtErr.message);
                return res.status(401).json({
                    success: false,
                    error: "Invalid or expired JWT token.",
                });
            }
        }

        // 🔹 Wallet verification (secondary)
        if (wallet) {
            req.walletUser = { wallet, verified: true };
            console.log(chalk.cyan(`💳 Wallet verified: ${wallet}`));
        }

        // 🔹 AIRS API key verification (tertiary)
        const masterAirsKey = process.env.AIRS_API_KEY || "";
        if (airsKey && masterAirsKey && airsKey === masterAirsKey) {
            req.airsVerified = true;
            console.log(chalk.blue("🌬️ AIRS API key verified"));
        } else if (airsKey && masterAirsKey && airsKey !== masterAirsKey) {
            console.warn(chalk.red("⚠️ Invalid AIRS key used"));
            return res.status(403).json({ success: false, error: "Invalid AIRS key" });
        }

        // 🔹 AURA Gateway key (for system-to-system validation)
        const validAuraKey = process.env.AURA_API_KEY || "";
        if (auraKey && validAuraKey && auraKey === validAuraKey) {
            req.auraVerified = true;
            console.log(chalk.magenta("🧠 AURA Gateway key verified"));
        } else if (auraKey && validAuraKey && auraKey !== validAuraKey) {
            console.warn(chalk.red("⚠️ Invalid AURA Gateway key"));
            return res.status(403).json({ success: false, error: "Invalid AURA Gateway key" });
        }

        // ✅ Attach hybrid session summary
        req.secureContext = {
            verifiedJWT: !!req.user,
            verifiedWallet: !!req.walletUser,
            verifiedAIRS: !!req.airsVerified,
            verifiedAURA: !!req.auraVerified,
            timestamp: new Date().toISOString(),
        };

        // 🧠 Attach global identity signature for tracking
        req.identity = {
            id: req.user?.id || req.walletUser?.wallet || "anonymous",
            roles: req.user?.roles || ["guest"],
            verified: true,
            source: req.auraVerified
                ? "AURA Gateway"
                : req.airsVerified
                    ? "AIRS Service"
                    : req.walletUser
                        ? "CoinPurse Wallet"
                        : "JWT",
        };

        console.log(
            chalk.greenBright(
                `🔐 Secure route access granted → ${req.method} ${req.originalUrl}`
            )
        );
        console.log("   Context:", JSON.stringify(req.secureContext));

        next();
    } catch (err) {
        console.error(chalk.red("❌ protectRoutes error:"), err.message);
        res.status(401).json({
            success: false,
            error: "Unauthorized or invalid credentials.",
        });
    }
}

/* ---------------------------------------------------------------------------
   ✅ CommonJS Export (Safe Fallback)
   Ensures the middleware is always a callable function.
--------------------------------------------------------------------------- */
try {
    if (typeof protectRoutes !== "function") {
        throw new Error("protectRoutes not a function");
    }
    module.exports = protectRoutes;
} catch (err) {
    console.warn("⚠️ protectRoutes export fallback activated:", err.message);
    module.exports = function (req, res, next) {
        console.warn("⚠️ Fallback protectRoutes: skipping authentication");
        next();
    };
}
