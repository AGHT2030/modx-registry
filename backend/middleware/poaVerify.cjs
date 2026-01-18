/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * POA Verification Middleware — Signed Token + Replay Guard + Revocation + EMF
 *
 * Updates:
 *  - Route-specific EMF label (route:<baseUrl><path>)
 *  - Optional debug proof middleware fired (X-MODX-POA-VERIFIED: 1)
 *  - Revocation path support (POA_REVOCATION_PATH)
 *  - Audit correlation id (x-request-id fallback)
 *  - Latency capture (reserved; can enable if your EMF logger supports it)
 */

const crypto = require("crypto");
const { verifyHmac } = require("../security/poa/poaTokens.cjs");
const { NonceStore } = require("../security/poa/nonceStore.cjs");
const { isRevoked, DEFAULT_PATH } = require("../security/poa/poaRevocationStore.cjs");

// CloudWatch EMF logger
const { logPoaMetrics } = require("../../docs/observability/node_cloudwatch_emf_logger.js");

// --------------------------------------------------
// NONCE STORE (REPLAY PROTECTION)
// --------------------------------------------------
const nonceStore = new NonceStore({
    ttlSeconds: Number(process.env.POA_NONCE_TTL_SECONDS || 900),
    maxSize: Number(process.env.POA_NONCE_MAX || 200000),
});

// --------------------------------------------------
// HELPERS
// --------------------------------------------------
function parseAuth(req) {
    const h = req.headers.authorization || "";
    if (!h) return null;
    const parts = h.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
    return null;
}

function routeLabel(req) {
    // Produces a stable label per endpoint
    // Example: "/api/investment" + "/intake" => "/api/investment/intake"
    const base = req.baseUrl || "";
    const p = req.path || "";
    const out = `${base}${p}`;
    return out && out !== "" ? out : "poaVerify";
}

function getRequestId(req) {
    const rid =
        req.headers["x-request-id"] ||
        req.headers["x-amzn-trace-id"] ||
        req.headers["x-correlation-id"] ||
        null;

    if (rid) return String(rid);

    // Lightweight fallback (not cryptographic identity, only correlation)
    return crypto.randomBytes(8).toString("hex");
}

// --------------------------------------------------
// POA VERIFY MIDDLEWARE
// --------------------------------------------------
function poaVerify({ scopeRequired = "intake:init", service = "poa-verifier" } = {}) {
    const secret = process.env.POA_TOKEN_SECRET;
    if (!secret) {
        // Fail CLOSED (regulator-safe)
        throw new Error("POA_TOKEN_SECRET missing — cannot verify POA tokens");
    }

    // Optional: allow explicit revocation file location
    const revocationPath = process.env.POA_REVOCATION_PATH || DEFAULT_PATH;

    return (req, res, next) => {
        const start = Date.now();
        const env = process.env.NODE_ENV || "prod";
        const route = routeLabel(req);
        const request_id = getRequestId(req);

        let ok = false;
        let invalidSig = 0;
        let replay = 0;
        let suspended = 0;
        let risk = 0.0;

        try {
            // --------------------------------------------------
            // TOKEN EXTRACTION
            // --------------------------------------------------
            const token = parseAuth(req) || req.query.poa_token || req.headers["x-modx-poa-token"];
            if (!token) {
                risk = 0.85;
                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 1,
                    ReplayAttempts: 0,
                    RiskScore: risk,
                    POASuspended: 0,
                });
                return res.status(401).json({ ok: false, error: "poa_missing_token", request_id });
            }

            // --------------------------------------------------
            // SIGNATURE VERIFICATION
            // --------------------------------------------------
            const v = verifyHmac(token, secret);
            if (!v.ok) {
                invalidSig = 1;
                risk = 0.85;

                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 1,
                    ReplayAttempts: 0,
                    RiskScore: risk,
                    POASuspended: 0,
                });

                return res.status(401).json({ ok: false, error: `poa_${v.error}`, request_id });
            }

            const payload = v.payload || {};
            const scope = payload.scope || [];
            const nonce = payload.nonce;
            const poaId = payload.poa_id;

            // --------------------------------------------------
            // BASIC CLAIM VALIDATION
            // --------------------------------------------------
            if (!poaId) {
                risk = 0.75;
                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 1,
                    ReplayAttempts: 0,
                    RiskScore: risk,
                    POASuspended: 0,
                });
                return res.status(401).json({ ok: false, error: "poa_missing_poa_id", request_id });
            }

            if (!Array.isArray(scope) || !scope.includes(scopeRequired)) {
                risk = 0.7;
                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 1,
                    ReplayAttempts: 0,
                    RiskScore: risk,
                    POASuspended: 0,
                });
                return res.status(403).json({ ok: false, error: "poa_scope_denied", request_id, poa_id: poaId });
            }

            if (!nonce || typeof nonce !== "string") {
                risk = 0.65;

                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 1,
                    ReplayAttempts: 0,
                    RiskScore: risk,
                    POASuspended: 0,
                });

                // ── GOVERNANCE-ALIGNED DENY ──
                return res.status(401).json({
                    ok: false,
                    error: "DENY_POA_INVALID",
                    reason: "DENY_POA_INVALID",
                    request_id,
                    poa_id: poaId,
                });
            }

            // --------------------------------------------------
            // REVOCATION CHECK (AUTHORITATIVE KILL SWITCH)
            // --------------------------------------------------
            if (isRevoked({ poa_id: poaId, nonce }, revocationPath)) {
                suspended = 1;
                risk = 0.98;

                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 0,
                    ReplayAttempts: 0,
                    RiskScore: risk,
                    POASuspended: 1,
                });

                // ── GOVERNANCE-ALIGNED DENY ──
                return res.status(403).json({
                    ok: false,
                    error: "DENY_POA_REVOKED",
                    reason: "DENY_POA_REVOKED",
                    request_id,
                    poa_id: poaId,
                });
            }

            // --------------------------------------------------
            // REPLAY PROTECTION
            // --------------------------------------------------
            if (nonceStore.seen(nonce)) {
                replay = 1;
                risk = 0.95;

                logPoaMetrics({ service, env, route }, {
                    InvalidSigRate: 0,
                    ReplayAttempts: 1,
                    RiskScore: risk,
                    POASuspended: 0,
                });

                // ── GOVERNANCE-ALIGNED DENY ──
                return res.status(409).json({
                    ok: false,
                    error: "DENY_REPLAY",
                    reason: "DENY_REPLAY",
                    request_id,
                    poa_id: poaId,
                });
            }

            // Mark nonce as used
            nonceStore.mark(nonce);

            // --------------------------------------------------
            // ATTACH POA CONTEXT (AUDITABLE)
            // --------------------------------------------------
            req.poa = {
                poa_id: poaId,
                scope,
                nonce,
                token_iss: payload.issuer || "MODX_TRUST",
                token_exp: payload.exp,
                request_id,
                route,
            };

            ok = true;
            risk = 0.1;

            // Optional: prove middleware fired without logging sensitive data
            if (
                (req.query && String(req.query._debug) === "1") ||
                String(req.headers["x-modx-debug"] || "") === "1"
            ) {
                res.setHeader("X-MODX-POA-VERIFIED", "1");
                res.setHeader("X-MODX-POA-ID", String(poaId));
                res.setHeader("X-MODX-REQUEST-ID", String(request_id));
            }

            return next();
        } finally {
            const latency_ms = Date.now() - start;

            // Always emit baseline metric for verifier activity (even OK)
            logPoaMetrics({ service, env, route }, {
                InvalidSigRate: invalidSig,
                ReplayAttempts: replay,
                RiskScore: risk,
                POASuspended: suspended,
            });

            void latency_ms;
        }
    };
}

module.exports = { poaVerify };
