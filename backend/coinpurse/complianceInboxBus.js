
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

// © 2025 AIMAL Global Holdings | CoinPurse Compliance Inbox Engine
// Feeds policy changes, Sentinel alerts, and AURA recommendations into business inboxes.

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const INBOX_DB = path.join(__dirname, "../vault/complianceInbox.json");

// ------------------------------------------------------------
// Load or initialize storage
// ------------------------------------------------------------
function loadInbox() {
    if (!fs.existsSync(INBOX_DB)) return [];
    return JSON.parse(fs.readFileSync(INBOX_DB, "utf8"));
}

function saveInbox(data) {
    fs.writeFileSync(INBOX_DB, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------------
// Push new message into inbox
// ------------------------------------------------------------
function pushInbox(event) {
    const inbox = loadInbox();
    inbox.push({ id: Date.now(), ...event, read: false, ts: new Date().toISOString() });
    saveInbox(inbox);
}

global.COINPURSE_PUSH_INBOX = pushInbox;

// ------------------------------------------------------------
// API: GET inbox
// ------------------------------------------------------------
router.get("/", (req, res) => {
    const inbox = loadInbox().sort((a, b) => b.id - a.id);
    res.json({ ok: true, inbox });
});

// ------------------------------------------------------------
// API: Mark message read
// ------------------------------------------------------------
router.post("/read/:id", (req, res) => {
    const inbox = loadInbox();
    const id = parseInt(req.params.id);
    const msg = inbox.find(i => i.id === id);

    if (!msg) return res.json({ ok: false, error: "Message not found" });

    msg.read = true;
    saveInbox(inbox);

    res.json({ ok: true });
});

module.exports = router;