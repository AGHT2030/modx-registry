/**
 * © 2025 AG Holdings Trust | Oversite Intelligence Store
 * Sovereign sealed-intel database for MODX Oversite Council.
 *
 * PURPOSE:
 *  - Immutable anomaly storage
 *  - Forensic rollback reconstruction
 *  - PQC alert archiving
 *  - Heatmap snapshots
 *  - Council decision support
 *
 * SECURITY MODEL:
 *  - Write-only (no delete endpoints exist)
 *  - SHA3-512 ledger chain (per entry)
 *  - PQC signature on each record (Dilithium seed signer)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Database file
const INTEL_PATH = path.join(__dirname, "intel.db");

// Ledger checkpoint file
const LEDGER_PATH = path.join(__dirname, "ledger.chain");

// Initialize DB if missing
if (!fs.existsSync(INTEL_PATH)) fs.writeFileSync(INTEL_PATH, "");
if (!fs.existsSync(LEDGER_PATH)) fs.writeFileSync(LEDGER_PATH, "");

/* ---------------------------------------------------------
   🔐 SHA3-512 HASHER
--------------------------------------------------------- */
function sha3(data) {
    return crypto.createHash("sha3-512").update(data).digest("hex");
}

/* ---------------------------------------------------------
   🔑 PQC DILITHIUM SIGNER (Mocked for now)
   Replace when your PQC module goes live.
--------------------------------------------------------- */
function pqcSign(payload) {
    return sha3(JSON.stringify(payload) + "_PQC");
}

/* ---------------------------------------------------------
   🟣 Append intel entry (IMMUTABLE WRITE)
--------------------------------------------------------- */
function appendIntel(type, payload) {
    const timestamp = Date.now();

    const entry = {
        type,
        timestamp,
        payload,
    };

    const serialized = JSON.stringify(entry);

    // PQC signature for authenticity
    const signature = pqcSign(entry);

    // Build ledger chain
    const lastHash = fs.readFileSync(LEDGER_PATH, "utf-8") || "";
    const newHash = sha3(lastHash + serialized + signature);

    // Write hashed chain forward
    fs.writeFileSync(LEDGER_PATH, newHash);

    const record = {
        entry,
        signature,
        ledgerHash: newHash,
    };

    // Append to DB file
    fs.appendFileSync(INTEL_PATH, JSON.stringify(record) + "\n");

    return record;
}

/* ---------------------------------------------------------
   🟢 PUBLIC API
--------------------------------------------------------- */
module.exports = {
    appendIntel,
};
