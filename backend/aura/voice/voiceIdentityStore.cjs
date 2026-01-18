
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

// © 2025 Mia Lopez | Voice Identity Store
// Maps user → voice template hash → PQC key refs → rights + roles.

const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(__dirname, "../../..", "AGVault", "voice");
const STORE_FILE = path.join(STORE_DIR, "voiceIdentities.json");

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

let cache = { identities: [] };

function loadStore() {
    if (fs.existsSync(STORE_FILE)) {
        cache = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    }
}

function saveStore() {
    fs.writeFileSync(STORE_FILE, JSON.stringify(cache, null, 2));
}

loadStore();

/**
 * Create or update a voice identity record
 */
function upsertVoiceIdentity({
    userId,
    voiceTemplateHash,
    pqcPublicKey,
    pqcPrivateKeyRef,
    rights = {},
    roles = [],
    iso20022Party = {}
}) {
    const existing = cache.identities.find(
        (id) => id.userId === userId
    );

    const baseRecord = {
        userId,
        voiceTemplateHash,
        pqcPublicKey,
        pqcPrivateKeyRef,
        rights,          // { music: [], patents: [], copyright: [] }
        roles,           // ["DAO_VOTER", "INVESTOR", "CREATOR"]
        iso20022Party,   // { partyId, orgId, lei, country, kycRef }
        lastUpdated: new Date().toISOString()
    };

    if (existing) {
        Object.assign(existing, baseRecord);
    } else {
        cache.identities.push({
            id: `V-ID-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createdAt: new Date().toISOString(),
            ...baseRecord
        });
    }

    saveStore();
    return baseRecord;
}

function findByUserId(userId) {
    return cache.identities.find((id) => id.userId === userId) || null;
}

function findByTemplateHash(voiceTemplateHash) {
    return cache.identities.find((id) => id.voiceTemplateHash === voiceTemplateHash) || null;
}

module.exports = {
    upsertVoiceIdentity,
    findByUserId,
    findByTemplateHash
};
