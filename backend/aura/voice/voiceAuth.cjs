
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

// © 2025 Mia Lopez | Voice Auth & Command Gating

const { deriveVoiceTemplateHash, pqcSign } = require("./voiceCrypto");
const { findByUserId, findByTemplateHash } = require("./voiceIdentityStore");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.AURA_JWT_SECRET || "change-me-please";

/**
 * Verify live voice against stored template (simplified).
 * In production you will:
 *  - use a proper voice biometric engine
 *  - include liveness + anti-clone checks
 */
function verifyVoiceMatch(storedHash, voiceFeaturesBuffer) {
    const liveHash = deriveVoiceTemplateHash(voiceFeaturesBuffer);
    return storedHash === liveHash;
}

/**
 * Issue a short-lived auth token after voice verification.
 */
function issueVoiceSessionToken(userId, context = {}) {
    return jwt.sign(
        {
            sub: userId,
            scope: "voice-verified",
            ctx: context
        },
        JWT_SECRET,
        { expiresIn: "5m" }
    );
}

/**
 * Core login: email/userId + voice sample → voice-verified JWT
 */
function voiceLogin({ userId, voiceFeatures }) {
    const identity = findByUserId(userId);
    if (!identity) {
        throw new Error("VOICE_IDENTITY_NOT_FOUND");
    }

    const ok = verifyVoiceMatch(identity.voiceTemplateHash, voiceFeatures);
    if (!ok) {
        throw new Error("VOICE_VERIFICATION_FAILED");
    }

    const token = issueVoiceSessionToken(userId, {
        roles: identity.roles,
        iso20022Party: identity.iso20022Party
    });

    // Optionally sign an audit string with PQC ref
    const auditSig = pqcSign(
        identity.pqcPrivateKeyRef,
        Buffer.from(`VOICE_LOGIN:${userId}:${Date.now()}`).toString("hex")
    );

    return { token, auditSig };
}

/**
 * Command-level authorization: for AURA / Mission Control phrases
 */
function authorizeVoiceCommand({ commandKey, voiceFeatures }) {
    const candidate = findByTemplateHash(
        deriveVoiceTemplateHash(
            Buffer.isBuffer(voiceFeatures)
                ? voiceFeatures
                : Buffer.from(String(voiceFeatures))
        )
    );
    if (!candidate) return { allowed: false, reason: "NO_MATCH" };

    // Example policy: only certain roles can trigger mesh mode changes
    const allowedRolesByCommand = {
        "MESH_MODE_SWITCH": ["FOUNDER", "CISO", "SYSTEM_ADMIN"],
        "MISSION_LOCKDOWN": ["FOUNDER", "CISO"],
        "BROADCAST_MODE": ["FOUNDER", "INVESTOR_RELATIONS"]
    };

    const allowedRoles = allowedRolesByCommand[commandKey] || [];
    const hasRole = candidate.roles.some((role) => allowedRoles.includes(role));

    return {
        allowed: hasRole,
        userId: candidate.userId,
        roles: candidate.roles,
        iso20022Party: candidate.iso20022Party
    };
}

module.exports = {
    voiceLogin,
    authorizeVoiceCommand
};
