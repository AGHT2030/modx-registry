/**
 * © 2025 AG Holdings Trust | MODX Sovereign Governance Engine
 * FULL C5 + QUANTUM SENTINEL + FORENSICS + HEATMAP INTEGRATED VERSION
 */

const express = require("express");
const router = express.Router();

const Forensics = require("../governance/ForensicsEngine.cjs");
const { generateGovHeatmap } = require("../governance/HeatmapGenerator.cjs");

const C5 = require("../sentinel/C5_Engine.cjs");
const C5Propagation = require("../sentinel/C5_RouterPropagation.cjs");
const QuantumSentinel = require("../sentinel/QuantumSentinel.cjs");

// Initialize global counters if missing
global.GOV_EVENTS = global.GOV_EVENTS || 0;
global.GOV_EVENTS_LOG = global.GOV_EVENTS_LOG || [];
global.UNAUTH_COUNT = global.UNAUTH_COUNT || 0;

/* -----------------------------------------------------------
 * Utility: record governance event for forensics
 * ----------------------------------------------------------- */
function logGovEvent(type, details) {
    global.GOV_EVENTS_LOG.push({
        timestamp: Date.now(),
        type,
        details
    });
}

/* -----------------------------------------------------------
 * Utility: evaluate threat + propagate + maybe engage QS
 * Called every time governance changes occur
 * ----------------------------------------------------------- */
function runThreatPipeline(triggerLabel, reqUser = null) {
    global.GOV_EVENTS++;

    const threat = C5.evaluate({
        drift: "NORMAL",
        fpMatch: "MATCH",
        unauthorized: global.UNAUTH_COUNT,
        govEvents: global.GOV_EVENTS,
    });

    C5Propagation.apply(threat);

    // If HIGH or CRITICAL → initiate countermeasures
    if (threat === "HIGH" || threat === "CRITICAL") {
        console.warn(`🛑 Quantum Sentinel Engaged during ${triggerLabel}`);

        QuantumSentinel.engage(threat);

        return {
            lockdown: true,
            threat,
            message: "Quantum Sentinel activated due to elevated threat level."
        };
    }

    return { lockdown: false, threat };
}

/* -----------------------------------------------------------
 * GET: Governance Proposals
 * ----------------------------------------------------------- */
router.get("/proposals", (req, res) => {
    const proposals = global.GOV_PROPOSALS || [];
    res.json({ proposals });
});

/* -----------------------------------------------------------
 * POST: Create a new Proposal
 * ----------------------------------------------------------- */
router.post("/propose", (req, res) => {
    const { action, domain, payload } = req.body;

    if (!global.GOV_PROPOSALS) global.GOV_PROPOSALS = [];

    const id = global.GOV_PROPOSALS.length + 1;

    const proposal = {
        id,
        action,
        domain,
        payload,
        status: "PENDING",
        createdAt: Date.now()
    };

    global.GOV_PROPOSALS.push(proposal);

    logGovEvent("PROPOSE", `Proposal ${id} created on domain ${domain}`);

    const result = runThreatPipeline(`proposal:create #${id}`, req.user);

    res.json({
        proposal,
        threat: result.threat,
        lockdown: result.lockdown
    });
});

/* -----------------------------------------------------------
 * POST: Approve a Proposal
 * ----------------------------------------------------------- */
router.post("/approve/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const prop = global.GOV_PROPOSALS?.find(p => p.id === id);

    if (!prop) return res.status(404).json({ error: "Proposal not found" });

    prop.status = "APPROVED";

    logGovEvent("APPROVE", `Proposal ${id} approved`);

    const result = runThreatPipeline(`proposal:approve #${id}`, req.user);

    res.json({
        proposal: prop,
        threat: result.threat,
        lockdown: result.lockdown
    });
});

/* -----------------------------------------------------------
 * POST: Execute a Proposal
 * ----------------------------------------------------------- */
router.post("/execute/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const prop = global.GOV_PROPOSALS?.find(p => p.id === id);

    if (!prop) return res.status(404).json({ error: "Proposal not found" });

    prop.status = "EXECUTED";
    prop.executedAt = Date.now();

    logGovEvent("EXECUTE", `Proposal ${id} executed`);

    const result = runThreatPipeline(`proposal:execute #${id}`, req.user);

    res.json({
        proposal: prop,
        threat: result.threat,
        lockdown: result.lockdown
    });
});

/* -----------------------------------------------------------
 * GET: Governance Heatmap (C5-correlated)
 * ----------------------------------------------------------- */
router.get("/heatmap", (req, res) => {
    // Viewing the heatmap counts as a governance observation event
    logGovEvent("VIEW_HEATMAP", "Heatmap viewed");

    const result = runThreatPipeline("heatmap:view", req.user);

    res.json({
        map: generateGovHeatmap(),
        threat: result.threat,
        lockdown: result.lockdown
    });
});
const Correlation = require("../governance/GovCorrelationEngine.cjs");

router.get("/correlation", (req, res) => {
    res.json({ map: Correlation.correlate() });
});

/* -----------------------------------------------------------
 * GET: Governance Forensics Timeline
 * ----------------------------------------------------------- */
router.get("/forensics", (req, res) => {
    res.json({
        timeline: Forensics.generateTimeline()
    });
});

module.exports = router;
