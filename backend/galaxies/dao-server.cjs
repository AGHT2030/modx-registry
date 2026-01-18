"use strict";
console.log("🚨 DAO SERVER FILE LOADED");

/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * DAO Galaxy — Authoritative Runtime
 */

const express = require("express");
const app = express();

require("../services/dao/daoQueueConsumer.cjs").start();

/* -------------------------------------------------
 * REQUIRED: body parser BEFORE routes
 * ------------------------------------------------- */
app.use(express.json({ limit: "2mb" }));

/* -------------------------------------------------
 * ROUTES (registered BEFORE listen)
 * ------------------------------------------------- */
app.use("/api/galaxy", require("../routes/galaxyRoute.cjs"));
app.use("/api/dao", require("../routes/dao/commit-route.cjs"));
app.use("/api/dao", require("../routes/dao/read-route.cjs"));

// Start DAO queue consumer (A5)
try {
    const { start } = require("../services/dao/daoQueueConsumer.cjs");
    start();
} catch (e) {
    console.error("DAO_QUEUE_CONSUMER_BOOT_ERROR:", e.message);
}

/* -------------------------------------------------
 * Health (galaxy-level)
 * ------------------------------------------------- */
app.get("/health", (_req, res) => {
    res.status(200).json({
        service: "DAO",
        status: "online",
        time: new Date().toISOString()
    });
});

console.log("🚨 ABOUT TO CALL app.listen()");

/* -------------------------------------------------
 * START SERVER (LAST LINE — MUST EXECUTE)
 * ------------------------------------------------- */
const PORT = Number(process.env.DAO_PORT || 9090);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🟢 DAO galaxy online on ${PORT}`);
});
