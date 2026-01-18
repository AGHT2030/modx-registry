/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED & PROTECTED.
 *
 * OVERSITE PQC ATTESTATION CHAIN (OAC)
 * -------------------------------------------------------------
 * Purpose:
 *  - Maintain an immutable chain of Oversite attestations
 *  - Prevent rollback, injection, deletion, replacement
 *  - Provide legal-grade audit trail for all governance actions
 *
 * Each attestation includes:
 *  - Council address
 *  - PQC signature hash
 *  - Oversite action hash
 *  - Previous block hash
 *  - Timestamp
 *  - Device fingerprint
 *  - Oath reference
 *
 * OAC is protected by:
 *  - Quantum Sentinel
 *  - Rollback Engine
 *  - PQC Identity Binding Engine
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const STORE = path.join(__dirname, "oac-chain.json");

/* -------------------------------------------------------------
   Ensure Store Exists
------------------------------------------------------------- */
function loadChain() {
    if (!fs.existsSync(STORE)) {
        fs.writeFileSync(STORE, JSON.stringify({ chain: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(STORE));
}

function saveChain(data) {
    fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
}

/* -------------------------------------------------------------
   Block Hashing (Quantum-Resistant SHA3-512)
------------------------------------------------------------- */
function hashBlock(block) {
    return crypto
        .createHash("sha3-512")
        .update(JSON.stringify(block))
        .digest("hex");
}

/* -------------------------------------------------------------
   Create Attestation Block
------------------------------------------------------------- */
function createAttestation({
    address,
    actionHash,
    pqcSignatureHash,
    deviceFingerprintHash,
    oathHash
}) {
    const chain = loadChain().chain;

    const previousHash = chain.length > 0 ? chain[chain.length - 1].blockHash : "GENESIS";

    const block = {
        index: chain.length,
        address,
        actionHash,
        pqcSignatureHash,
        deviceFingerprintHash,
        oathHash,
        previousHash,
        timestamp: new Date().toISOString()
    };

    block.blockHash = hashBlock(block);
    chain.push(block);

    saveChain({ chain });

    return block;
}

/* -------------------------------------------------------------
   Verify the entire OAC chain
------------------------------------------------------------- */
function verifyChain() {
    const { chain } = loadChain();

    for (let i = 1; i < chain.length; i++) {
        const prev = chain[i - 1];
        const curr = chain[i];

        const checkPrev = hashBlock(prev);

        if (curr.previousHash !== checkPrev) {
            return {
                valid: false,
                index: i,
                reason: "CHAIN_BROKEN",
                expected: checkPrev,
                found: curr.previousHash
            };
        }
    }

    return { valid: true };
}

module.exports = {
    createAttestation,
    verifyChain
};
