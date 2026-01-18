/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * AIRS Galaxy — Governance-First Runtime
 */

const express = require("express");
const app = express();

app.use(express.json({ limit: "2mb" }));

const { requireModlinkProof } =
    require("../mode/middleware/requireModlinkProof.cjs");

// 👇 async bridge
const loadAirsRouter = require("../airs/routes/concierge.routes.cjs");

(async () => {
    const airsRouter = await loadAirsRouter();

    app.use(
        "/api/airs",
        requireModlinkProof("AIRS_REQUEST"),
        airsRouter
    );

    app.get("/health", (_req, res) => {
        res.json({
            service: "AIRS",
            status: "online",
            governance: "MODLINK_REQUIRED",
            activation: "TRUSTEE_LOCKED",
            time: new Date().toISOString()
        });
    });

    const PORT = process.env.AIRS_PORT || 8090;
    app.listen(PORT, "0.0.0.0", () =>
        console.log(`🟢 AIRS galaxy online on ${PORT}`)
    );
})();
