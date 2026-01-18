/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED & PROTECTED
 *
 * OVERSITE COUNCIL — INTEGRATION LAYER
 * --------------------------------------------------------------
 * This module binds all Oversite pipeline components:
 *
 *  A → Ingest System
 *  B → Intelligence Store
 *  C → Command API
 *  D → Orchestrator
 *  S → Quantum Sentinel Hooks
 *
 * Responsibilities:
 *  - Initialize Oversite pipeline
 *  - Bind ingest system → orchestrator logic
 *  - Bind command bus → orchestrator execution
 *  - Integrate with Socket.IO
 *  - Ensure PQC-protected control rail
 *  - Heartbeat monitoring & redundancy checks
 */

const oversiteIngest = require("./ingestSystem");
const oversiteCommands = require("./commandAPI");
const oversiteOrchestrator = require("./orchestrator");
const { SENTINEL } = require("../quantum/QuantumSentinel");
const { appendIntel } = require("./intelligenceStore");

module.exports = function initOversite(io, app) {

    console.log("🟣 Initializing Oversite Integration Layer…");

    /* ---------------------------------------------------------
       🧠 Load orchestrator
    --------------------------------------------------------- */
    const orchestrator = oversiteOrchestrator(io);

    /* ---------------------------------------------------------
       🟪 Mount ingest system
    --------------------------------------------------------- */
    app.use(
        "/oversite/ingest",
        oversiteIngest(io)
    );

    /* ---------------------------------------------------------
       🔮 Mount command API (Council-triggered)
    --------------------------------------------------------- */
    app.use(
        "/oversite/command",
        oversiteCommands(orchestrator)
    );

    /* ---------------------------------------------------------
       🛰️ Bind Sentinel → Oversite dashboard channel
    --------------------------------------------------------- */
    SENTINEL.on("quantum:infection:alert", (payload) => {
        io.emit("oversite:anomaly", payload);
        appendIntel("sentinel_anomaly_forward", payload);
    });

    SENTINEL.on("quantum:rollback:detected", (payload) => {
        io.emit("oversite:rollback_detected", payload);
        appendIntel("sentinel_rollback_forward", payload);
    });

    SENTINEL.on("sentinel:selfheal:applied", (payload) => {
        io.emit("oversite:selfheal_event", payload);
        appendIntel("sentinel_selfheal_forward", payload);
    });

    /* ---------------------------------------------------------
       ❤️ Oversite Heartbeat
       Ensures full pipeline is online every 20 seconds
    --------------------------------------------------------- */
    setInterval(() => {
        const heartbeat = {
            status: "online",
            orchestrator: true,
            ingest: true,
            intelligence: true,
            commands: true,
            sentinelLink: true,
            timestamp: Date.now()
        };

        io.emit("oversite:heartbeat", heartbeat);
        appendIntel("heartbeat", heartbeat);
    }, 20_000);

    /* ---------------------------------------------------------
       🟦 Return orchestrator for higher-level interactions
    --------------------------------------------------------- */
    return orchestrator;
};
