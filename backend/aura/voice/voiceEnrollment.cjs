
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

// © 2025 Mia Lopez | Voice Enrollment Flow

const { deriveVoiceTemplateHash, pqcGenerateKeypair } = require("./voiceCrypto");
const { upsertVoiceIdentity } = require("./voiceIdentityStore");

/**
 * Enroll a new voice identity
 * @param {Object} params
 * @param {String} params.userId
 * @param {Buffer|String} params.voiceFeatures   // extracted MFCC/embedding
 * @param {Object} params.iso20022Party         // party identifiers for ISO 20022 mapping
 */
function enrollVoiceIdentity({ userId, voiceFeatures, iso20022Party = {} }) {
    const voiceTemplateHash = deriveVoiceTemplateHash(
        Buffer.isBuffer(voiceFeatures)
            ? voiceFeatures
            : Buffer.from(String(voiceFeatures))
    );

    const { publicKey, privateKeyRef } = pqcGenerateKeypair();

    const record = upsertVoiceIdentity({
        userId,
        voiceTemplateHash,
        pqcPublicKey: publicKey,
        pqcPrivateKeyRef: privateKeyRef,
        rights: {},
        roles: [],
        iso20022Party
    });

    return {
        voiceTemplateHash,
        pqcPublicKey: publicKey,
        identity: record
    };
}

module.exports = {
    enrollVoiceIdentity
};
