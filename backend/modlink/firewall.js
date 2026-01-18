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

// backend/modlink/firewall.js
// © 2025 AIMAL Global Holdings | MODLINK Firewall Layer
// Central security gateway for every module/DAO routed through MODLINK
// Protects finance/invest routes, MODH, MODE, MODPLAY, etc.

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const geoip = require("geoip-lite");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { URL } = require("url");
const logger = require("../../logger");
const fs = require("fs");
const path = require("path");

// ---------- Canonical Governance Deny Reasons ----------
const DENY_REASONS = Object.freeze({
    DENY_POLICY: "DENY_POLICY"
});

// ---------- Configuration ----------
const TRUSTED_ORIGINS = (process.env.MODLINK_TRUSTED_ORIGINS ||
    "https://app.coinpurse.org,https://dashboard.creatvnetwork.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const RATE_WINDOW_MS =
    parseInt(process.env.MODLINK_RATE_WINDOW_MS || "15") * 60 * 1000;
const RATE_MAX = parseInt(process.env.MODLINK_RATE_MAX || "1000");
const HMAC_SECRET = process.env.MODLINK_HMAC_SECRET || null;
const VAULT_KEY_PATH =
    process.env.MODLINK_VAULT_PATH || "/var/lib/modlink/vault.json.enc";
const GEOBLOCK_LIST = (process.env.MODLINK_GEO_BLOCK || "KP,RU,IR,SY,CU")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const ADDRESS_VALIDATE_ALLOW = (
    process.env.MODLINK_ALLOW_ADDRESS_TYPES || "ETH"
)
    .split(",")
    .map((s) => s.trim().toUpperCase());

// ---------- In-memory state ----------
const ipScore = new Map();
const blacklist = new Set();
const auditLogPath =
    process.env.MODLINK_AUDIT_LOG_PATH ||
    path.join(__dirname, "modlink_audit.log");

// ---------- Audit Helpers ----------
function appendAudit(entry) {
    try {
        const line = `${new Date().toISOString()} ${JSON.stringify(entry)}\n`;
        fs.appendFile(auditLogPath, line, (err) => {
            if (err) logger.warn("Failed writing audit log:", err.message);
        });
    } catch (err) {
        logger.warn("appendAudit error:", err);
    }
}

/**
 * Standardized governance deny emitter
 */
function auditDeny(req, ip, denyReason, extra = {}) {
    const correlationId =
        req.headers["x-correlation-id"] ||
        crypto.randomUUID();

    const action =
        req.headers["x-modlink-action"] ||
        req.body?.action ||
        "UNKNOWN_ACTION";

    const resource = req.originalUrl || req.url || "UNKNOWN_RESOURCE";

    appendAudit({
        decision: "DENY",
        denyReason,
        correlationId,
        action,
        resource,
        ip,
        ...extra
    });

    req.headers["x-correlation-id"] = correlationId;
    return correlationId;
}

// ---------- Helper Utilities ----------
function hmacVerify(payloadRaw, signature) {
    if (!HMAC_SECRET || !signature) return false;
    const h = crypto.createHmac("sha256", HMAC_SECRET)
        .update(payloadRaw)
        .digest("hex");
    const [, sigHex] = signature.match(/^(?:sha256=)?(.+)$/) || [];
    return (
        sigHex &&
        crypto.timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(sigHex, "hex"))
    );
}

function shallowSanitize(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const out = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
        if (/(\.env|process\.env|__proto__|constructor|prototype|global)/i.test(k))
            continue;
        if (
            typeof v === "string" &&
            /(\b(import|require|process\.env|fs\.readFile)\b)/i.test(v)
        ) {
            out[k] = "[removed]";
            continue;
        }
        out[k] = v;
    }
    return out;
}

function checkTrustedOrigin(originHeader) {
    if (!originHeader) return false;
    try {
        const url = new URL(originHeader);
        const origin = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
        return TRUSTED_ORIGINS.some((t) => origin.startsWith(t));
    } catch {
        return false;
    }
}

function isEthAddress(addr) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function validateAddress(type, addr) {
    type = (type || "ETH").toUpperCase();
    if (!ADDRESS_VALIDATE_ALLOW.includes(type)) return false;
    if (type === "ETH") return isEthAddress(addr);
    return false;
}

function markAndScoreIP(ip) {
    const now = Date.now();
    const entry = ipScore.get(ip) || { count: 0, lastSeen: now, strikes: 0 };
    entry.count += 1;
    entry.lastSeen = now;
    if (entry.count > 200) entry.strikes += 1;
    ipScore.set(ip, entry);
    return entry;
}

function isBlacklisted(ipOrToken) {
    return blacklist.has(ipOrToken);
}

function loadVaultSecrets() {
    try {
        if (!fs.existsSync(VAULT_KEY_PATH)) return null;
        const buf = fs.readFileSync(VAULT_KEY_PATH);
        return { raw: buf.toString("base64") };
    } catch (err) {
        logger.warn("Vault load error:", err.message);
        return null;
    }
}

// ---------- Rate Limiter ----------
const limiter = rateLimit({
    windowMs: RATE_WINDOW_MS,
    max: RATE_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    handler: (req, res) => {
        const cid = auditDeny(req, req.ip, DENY_REASONS.DENY_POLICY, {
            type: "rate_limit"
        });
        res.status(429).json({
            error: "GOVERNANCE_DENIED",
            reason: DENY_REASONS.DENY_POLICY,
            correlationId: cid
        });
    },
});

// ---------- Main Middleware ----------
module.exports = async function modlinkFirewall(req, res, next) {
    try {
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
        const urlPath = req.originalUrl || req.url || "";

        if (isBlacklisted(ip)) {
            const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                type: "blacklist"
            });
            return res.status(403).json({
                error: "GOVERNANCE_DENIED",
                reason: DENY_REASONS.DENY_POLICY,
                correlationId: cid
            });
        }

        const safeMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
        if (!safeMethods.includes(req.method)) {
            const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                type: "method_block",
                method: req.method
            });
            return res.status(405).json({
                error: "GOVERNANCE_DENIED",
                reason: DENY_REASONS.DENY_POLICY,
                correlationId: cid
            });
        }

        const origin = req.headers.origin || req.headers.referer || "";
        if (origin && !checkTrustedOrigin(origin)) {
            const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                type: "origin_reject",
                origin
            });
            logger.warn("MODLINK origin rejected:", origin, "for", urlPath);
            return res.status(403).json({
                error: "GOVERNANCE_DENIED",
                reason: DENY_REASONS.DENY_POLICY,
                correlationId: cid
            });
        }

        if (/\/api\/(modh|finance|invest|coinpurse)/i.test(urlPath)) {
            const geo = geoip.lookup(ip) || {};
            if (!geo || GEOBLOCK_LIST.includes(geo.country)) {
                const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                    type: "geo_block",
                    country: geo.country || "UNKNOWN"
                });
                logger.warn(
                    `MODLINK geo-blocked request from ${ip} (${geo.country}) to ${urlPath}`
                );
                return res.status(403).json({
                    error: "GOVERNANCE_DENIED",
                    reason: DENY_REASONS.DENY_POLICY,
                    correlationId: cid
                });
            }
        }

        await new Promise((resolve, reject) =>
            limiter(req, res, (err) => (err ? reject(err) : resolve()))
        );

        // HMAC verification
        let rawBody = "";
        if (req.headers["content-type"]?.includes("application/json")) {
            rawBody = req.rawBody ? req.rawBody : JSON.stringify(req.body || {});
        }

        const signature =
            req.headers["x-modlink-signature"] || req.headers["x-hub-signature-256"];
        if (signature && HMAC_SECRET) {
            if (!hmacVerify(rawBody, signature)) {
                const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                    type: "hmac_fail"
                });
                return res.status(401).json({
                    error: "GOVERNANCE_DENIED",
                    reason: DENY_REASONS.DENY_POLICY,
                    correlationId: cid
                });
            }
        }

        if (req.body) req.body = shallowSanitize(req.body);
        if (req.query) req.query = shallowSanitize(req.query);

        if (/\/api\/(invest|wrap|unwrap|tokens?)\b/i.test(urlPath)) {
            const candidate =
                req.body?.address ||
                req.body?.wallet ||
                req.query?.address ||
                req.query?.wallet;
            const chain = req.body?.chain || req.query?.chain || "ETH";
            if (!candidate || !validateAddress(chain, candidate)) {
                const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                    type: "addr_invalid",
                    candidate,
                    chain
                });
                return res.status(400).json({
                    error: "GOVERNANCE_DENIED",
                    reason: DENY_REASONS.DENY_POLICY,
                    correlationId: cid
                });
            }
        }

        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.MODLINK_JWT_SECRET || "dev-mode-secret"
                );
                req.modlink = req.modlink || {};
                req.modlink.tokenPayload = decoded;

                const requiredScope = determineRequiredScopeForPath(urlPath);
                if (
                    requiredScope &&
                    Array.isArray(decoded.scopes) &&
                    !decoded.scopes.includes(requiredScope)
                ) {
                    const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                        type: "scope_denied",
                        requiredScope,
                        tokenSub: decoded.sub
                    });
                    return res.status(403).json({
                        error: "GOVERNANCE_DENIED",
                        reason: DENY_REASONS.DENY_POLICY,
                        correlationId: cid
                    });
                }
            } catch (err) {
                const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                    type: "jwt_fail",
                    err: err.message
                });
                return res.status(401).json({
                    error: "GOVERNANCE_DENIED",
                    reason: DENY_REASONS.DENY_POLICY,
                    correlationId: cid
                });
            }
        }

        const scoreEntry = markAndScoreIP(ip);
        if (scoreEntry.strikes >= 3) {
            blacklist.add(ip);
            const cid = auditDeny(req, ip, DENY_REASONS.DENY_POLICY, {
                type: "auto_blacklist"
            });
            return res.status(403).json({
                error: "GOVERNANCE_DENIED",
                reason: DENY_REASONS.DENY_POLICY,
                correlationId: cid
            });
        }

        req.modlink = req.modlink || {};
        req.modlink.vault = loadVaultSecrets();

        const correlationId =
            req.headers["x-correlation-id"] ||
            crypto.randomBytes(12).toString("hex");
        req.headers["x-correlation-id"] = correlationId;
        res.setHeader("X-Correlation-ID", correlationId);

        appendAudit({
            decision: "REQUEST",
            ip,
            path: urlPath,
            method: req.method,
            origin,
            userAgent: req.headers["user-agent"],
            tokenSub: req.modlink?.tokenPayload?.sub || null,
            daoHint: req.modlink?.tokenPayload?.dao || null,
        });

        req.modlink.checkPolicy = function ({ dao, requiredPolicies = [] }) {
            const payload = req.modlink?.tokenPayload;
            if (!payload) return { ok: false, reason: "no_token" };
            if (
                dao &&
                payload.dao &&
                dao.toUpperCase() !== payload.dao.toUpperCase()
            ) {
                return { ok: false, reason: "dao_mismatch" };
            }
            const tokenPolicies = new Set(payload.policies || []);
            for (const p of requiredPolicies) {
                if (!tokenPolicies.has(p))
                    return { ok: false, reason: `missing_policy_${p}` };
            }
            return { ok: true };
        };

        return next();
    } catch (err) {
        logger.error("MODLINK firewall exception:", err);
        appendAudit({
            decision: "DENY",
            denyReason: DENY_REASONS.DENY_POLICY,
            err: err.message,
            stack: err.stack,
        });
        return res.status(500).json({
            error: "GOVERNANCE_DENIED",
            reason: DENY_REASONS.DENY_POLICY
        });
    }
};

// ---------- Helper ----------
function determineRequiredScopeForPath(pathStr) {
    try {
        const p = pathStr.toLowerCase();
        if (p.includes("/modh") || p.includes("/health")) return "health:read";
        if (p.includes("/invest") || p.includes("/wrap") || p.includes("/tokens"))
            return "finance:trade";
        if (p.includes("/admin")) return "admin:all";
        if (p.includes("/aura/") || p.includes("/speak") || p.includes("/dialogue"))
            return "aura:interact";
        return null;
    } catch {
        return null;
    }
}
