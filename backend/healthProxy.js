
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

// © 2025 Mia Lopez | MODX Health Proxy Gateway
// 🌐 Lightweight forwarder from port 8080 → backend (auto-detected 8083-8085)
// Provides public health + hybrid monitoring access with failover + rate limiting.

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const http = require("http");

const app = express();

// ----------------------------------------------------
// ⚙️ Auto-detect backend port (8083–8085 fallback scan)
// ----------------------------------------------------
async function detectBackendPort() {
    const candidates = [8083, 8084, 8085];
    for (const port of candidates) {
        const ok = await new Promise((resolve) => {
            const req = http.get({ host: "localhost", port, path: "/api/hybrids/status" }, (res) => {
                res.destroy();
                resolve(true);
            });
            req.on("error", () => resolve(false));
            req.setTimeout(2000, () => req.destroy());
        });
        if (ok) return port;
    }
    return 8083; // default if none reachable
}

(async () => {
    const backendPort = await detectBackendPort();
    const backendTarget = `http://localhost:${backendPort}`;
    console.log(`🧭 Detected backend target: ${backendTarget}`);

    // ----------------------------
    // ✅ Optional: rate-limit public access
    // ----------------------------
    const limiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 30, // 30 requests/min per IP
        message: { error: "Too many health checks, please slow down." },
    });
    app.use(limiter);

    // ----------------------------
    // 🔄 Proxy routes from :8080 → detected backend port
    // ----------------------------
    app.use(
        "/api/hybrids",
        createProxyMiddleware({
            target: backendTarget,
            changeOrigin: true,
            pathRewrite: { "^/api/hybrids": "/api/hybrids" },
            onProxyReq: (proxyReq, req) => {
                console.log(`🔁 Proxying ${req.method} ${req.originalUrl} → ${backendTarget}`);
            },
            onError: (err, req, res) => {
                console.error("❌ Proxy error:", err.message);
                res.status(502).json({ error: "Hybrid proxy failed", message: err.message });
            },
        })
    );

    // ----------------------------
    // 🩺 Root endpoint for sanity check
    // ----------------------------
    app.get("/", (req, res) => {
        res.json({
            service: "MODX Health Proxy",
            backend: backendTarget,
            status: "operational",
            timestamp: new Date().toISOString(),
        });
    });

    // ----------------------------
    // 🚀 Start listener
    // ----------------------------
    const PORT = 8080;
    app.listen(PORT, () => {
        console.log(`🌐 MODX Health Proxy running on http://localhost:${PORT} → ${backendTarget}`);
    });
})();
