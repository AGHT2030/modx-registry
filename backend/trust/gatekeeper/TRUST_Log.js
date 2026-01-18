
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

/**
 * © 2025 AIMAL Global Holdings | TRUST Log
 * Cryptographically-sealed TRUST governance log
 * 
 * Features:
 *  - Hash-chained log entries (tamper-evident)
 *  - Immutable append-only record
 *  - Timestamped governance trail
 *  - SHA3-512 ledger hashing
 *  - Used by Gatekeeper + Sentry + PrivilegeMatrix
 */

const crypto = require("crypto");

const TRUST_Log = {
    _ledger: [],

    /**
     * Create hash for an entry
     */
    _hash(data) {
        return crypto
            .createHash("sha3-512")
            .update(JSON.stringify(data))
            .digest("hex");
    },

    /**
     * Append log entry with hash-chain integrity
     */
    record(event = {}) {
        const prevHash =
            this._ledger.length > 0
                ? this._ledger[this._ledger.length - 1].hash
                : "GENESIS";

        const entry = {
            timestamp: Date.now(),
            event,
            prevHash,
            hash: null
        };

        entry.hash = this._hash(entry);

        this._ledger.push(entry);

        return entry;
    },

    /**
     * Return full TRUST ledger
     */
    getLedger() {
        return [...this._ledger];
    },

    /**
     * Last entry only
     */
    last() {
        return this._ledger[this._ledger.length - 1] || null;
    }
};

module.exports = TRUST_Log;
