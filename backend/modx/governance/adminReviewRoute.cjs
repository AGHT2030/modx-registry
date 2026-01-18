
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

// © 2025 AIMAL Global Holdings | Admin Review API (CJS)
const express = require("express");
const fs = require("fs");
const path = require("path");
const { proposePolicy, approvePolicy, rejectPolicy } = require("./modlinkDao.cjs");

const router = express.Router();

const QUEUE_PATH = path.resolve("./backend/modx/governance/logs/admin_review_queue.json");

// helper to read/initialize queue
function readQueue() {
    if (!fs.existsSync(QUEUE_PATH)) fs.writeFileSync(QUEUE_PATH, "[]");
    return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
}
function writeQueue(list) {
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(list, null, 2));
}

// 🔹 GET queue
router.get("/", (_req, res) => {
    res.json(readQueue());
});

// 🔹 POST enqueue external (optional; Sentinel already appends)
router.post("/enqueue", express.json(), (req, res) => {
    const q = readQueue();
    const item = {
        id: req.body?.rule?.id || `rule_${Date.now()}`,
        rule: req.body.rule || {},
        report: req.body.report || {},
        status: "pending_review",
        createdAt: new Date().toISOString(),
    };
    q.push(item);
    writeQueue(q);
    res.json(item);
});

// 🔹 POST propose → creates on-chain proposal
router.post("/propose/:ruleId", express.json(), async (req, res) => {
    try {
        const ruleId = req.params.ruleId;
        const memo = req.body?.memo || "Policy proposal via AdminReview";
        const { tx, proposalId } = await proposePolicy(ruleId, memo);

        // update queue
        const q = readQueue();
        const idx = q.findIndex((x) => x.rule?.id === ruleId);
        if (idx >= 0) {
            q[idx].status = "proposed";
            q[idx].proposalId = proposalId;
            q[idx].proposalTx = tx;
            q[idx].updatedAt = new Date().toISOString();
            writeQueue(q);
        }

        // broadcast
        if (global.auraIO) {
            global.auraIO.emit("modx:admin:proposed", { ruleId, proposalId, tx });
        }

        res.json({ ok: true, ruleId, proposalId, tx });
    } catch (e) {
        console.error("❌ propose error:", e.message);
        res.status(500).json({ ok: false, error: e.message });
    }
});

// 🔹 POST approve (on-chain)
router.post("/approve/:proposalId", express.json(), async (req, res) => {
    try {
        const proposalId = req.params.proposalId;
        const tx = await approvePolicy(proposalId);

        // mark queue item if known
        const q = readQueue();
        const idx = q.findIndex((x) => String(x.proposalId) === String(proposalId));
        if (idx >= 0) {
            q[idx].status = "approved";
            q[idx].approveTx = tx;
            q[idx].updatedAt = new Date().toISOString();
            writeQueue(q);
        }

        if (global.auraIO) {
            global.auraIO.emit("modx:admin:decision", {
                proposalId,
                status: "approved",
                tx,
            });
        }
        res.json({ ok: true, proposalId, tx });
    } catch (e) {
        console.error("❌ approve error:", e.message);
        res.status(500).json({ ok: false, error: e.message });
    }
});

// 🔹 POST reject (on-chain)
router.post("/reject/:proposalId", express.json(), async (req, res) => {
    try {
        const proposalId = req.params.proposalId;
        const tx = await rejectPolicy(proposalId);

        const q = readQueue();
        const idx = q.findIndex((x) => String(x.proposalId) === String(proposalId));
        if (idx >= 0) {
            q[idx].status = "rejected";
            q[idx].rejectTx = tx;
            q[idx].updatedAt = new Date().toISOString();
            writeQueue(q);
        }

        if (global.auraIO) {
            global.auraIO.emit("modx:admin:decision", {
                proposalId,
                status: "rejected",
                tx,
            });
        }
        res.json({ ok: true, proposalId, tx });
    } catch (e) {
        console.error("❌ reject error:", e.message);
        res.status(500).json({ ok: false, error: e.message });
    }
});

module.exports = router;
