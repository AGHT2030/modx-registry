
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

// © 2025 Mia Lopez | Voice Rights Tokenization (NFT / SBT metadata prep)

const { findByUserId, upsertVoiceIdentity } = require("./voiceIdentityStore");

/**
 * Prepare metadata for a Voice Identity Token (VIT) NFT or SBT
 * to be minted on XRPL/EVM.
 */
function buildVoiceIdentityTokenMetadata({ userId, chain }) {
    const identity = findByUserId(userId);
    if (!identity) throw new Error("VOICE_IDENTITY_NOT_FOUND");

    return {
        name: `Voice Identity Token – ${userId}`,
        description: "PQC-bound, ISO 20022-linked voice identity credential.",
        image: "ipfs://voice-identity-placeholder",
        attributes: [
            { trait_type: "voiceTemplateHash", value: identity.voiceTemplateHash },
            { trait_type: "pqcPublicKey", value: identity.pqcPublicKey },
            { trait_type: "roles", value: identity.roles.join(",") },
            { trait_type: "iso20022PartyId", value: identity.iso20022Party.partyId || "" },
            { trait_type: "chain", value: chain }
        ]
    };
}

/**
 * Bind rights (music, copyright, patents) to a voice identity
 * before or after NFT mint.
 */
function bindRightsToVoiceIdentity({ userId, rights }) {
    const identity = findByUserId(userId);
    if (!identity) throw new Error("VOICE_IDENTITY_NOT_FOUND");

    const mergedRights = {
        music: [...(identity.rights.music || []), ...(rights.music || [])],
        patents: [...(identity.rights.patents || []), ...(rights.patents || [])],
        copyright: [...(identity.rights.copyright || []), ...(rights.copyright || [])]
    };

    upsertVoiceIdentity({
        userId,
        voiceTemplateHash: identity.voiceTemplateHash,
        pqcPublicKey: identity.pqcPublicKey,
        pqcPrivateKeyRef: identity.pqcPrivateKeyRef,
        rights: mergedRights,
        roles: identity.roles,
        iso20022Party: identity.iso20022Party
    });

    return mergedRights;
}

module.exports = {
    buildVoiceIdentityTokenMetadata,
    bindRightsToVoiceIdentity
};
