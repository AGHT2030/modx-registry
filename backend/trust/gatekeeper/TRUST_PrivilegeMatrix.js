
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
 * © 2025 AIMAL Global Holdings | UNLICENSED
 * TRUST Privilege Matrix
 * ------------------------------------------------------
 * Defines:
 *  - privilege tiers
 *  - restricted actions
 *  - galaxy access limits
 *  - system roles
 *  - emergency escalation paths
 */

module.exports = {
    systemRoles: {
        ARI: {
            can: ["advise", "interpret", "guide", "contextualize"],
            cannot: ["modify_db", "write_ledger", "shutdown", "transfer_funds"]
        },

        AGADOR: {
            can: ["analyze", "summarize", "audit", "report"],
            cannot: ["modify_db", "alter_state", "shutdown", "transfer_funds"]
        },

        TRUST_SENTINEL: {
            can: ["block", "quarantine", "anonymize", "override"],
            cannot: ["modify_user_data", "forward_raw_identity"]
        },

        SYSTEM: {
            can: ["validate", "sign", "route", "seal"],
            cannot: []
        }
    },

    privilegeTiers: {
        TIER_0: {
            label: "Public / Guest",
            access: ["PLAY", "SHOP", "MOVE", "LEARN"],
            restrictions: ["no_write", "no_sensitive_data", "no_identity"]
        },

        TIER_1: {
            label: "Registered User",
            access: ["PLAY", "SHOP", "MOVE", "LEARN", "STAY"],
            restrictions: ["no_governance", "no_ledger_write"]
        },

        TIER_2: {
            label: "Business / Vendor",
            access: ["PLAY", "STAY", "SHOP", "WORK", "BUILD"],
            restrictions: ["no_trust_core", "no_privileged_streams"]
        },

        TIER_3: {
            label: "Enterprise / Government",
            access: ["ALL_EXCEPT_TRUST"],
            restrictions: ["cannot alter_tokens", "cannot alter_oracle"]
        },

        TRUST_CORE: {
            label: "AGH / TRUST / CONSTITUTION",
            access: ["ALL_GALAXIES", "ALL_STREAMS", "IMMUTABLE_CORE"],
            restrictions: []
        }
    },

    restrictedActions: [
        "modify_db",
        "transfer_funds",
        "shutdown",
        "bypass_firewall",
        "inject_identity",
        "spoof_session",
        "alter_governance_queue",
        "forge_pqc"
    ],

    emergencyProtocols: {
        escalateToTrust: [
            "identity_attack",
            "spoof_attempt",
            "session_anomaly",
            "ledger_conflict",
            "cross_galaxy_forbidden_hop"
        ]
    }
};
