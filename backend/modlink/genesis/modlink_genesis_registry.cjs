// © 2025 AG Holdings Trust | MODLINK Genesis Registry (Sealed CJS Edition)
// -----------------------------------------------------------------------
// This file defines the immutable genesis parameters for MODLINK,
// including roots of authority, constitutional anchors, and the
// governance bootstrapping sequence for the MODX Sovereign Universe.
// -----------------------------------------------------------------------

const { readFileSync } = require("fs");
const path = require("path");

// ---------------------------------------------------------
// Load Constitution + Declaration Hashes
// ---------------------------------------------------------
const constitutionHash = require("../../trust/trust_Constitution_Hash.json");
const universeDeclarationHash = require("../../trust/universe_declaration_hash.json");

// ---------------------------------------------------------
// GENESIS REGISTRY ROOT
// ---------------------------------------------------------
module.exports = Object.freeze({

    registry: "MODLINK_GENESIS",
    version: "2025.12.04",
    sealed: true,
    hash_algorithm: "SHA3-512",

    // ---------------------------------------------
    // Root Sovereign Authority
    // ---------------------------------------------
    sovereign_root: Object.freeze({
        trust: "AG_Holdings_Trust",
        ownership: "All universes, galaxies, modules, orbs, assets, tokens, and hybrids",
        constitution_hash: constitutionHash.hash,
        declaration_hash: universeDeclarationHash.hash,
        enforcement: "AURA + KZ + MODLINK layered enforcement"
    }),

    // ---------------------------------------------
    // Core Ledger Anchors
    // ---------------------------------------------
    anchors: Object.freeze({
        modx: {
            id: "MODX_UNIVERSE_ROOT",
            secured_by: ["AURA_Twins", "KZ_Compliance", "MODLINK_Governance"],
            sovereignty: true,
            immutable: true
        },
        coinpurse: {
            id: "COINPURSE_ROOT",
            secured_by: ["AURA", "KZ"],
            wallet_layer: true
        },
        hybrid: {
            id: "HYBRID_LAYER_ROOT",
            systems: ["AIRS", "CREATV", "MODE", "MODAStay"],
            zero_trust: true
        }
    }),

    // ---------------------------------------------
    // Genesis Governance Parameters
    // ---------------------------------------------
    governance: Object.freeze({
        primary: "MODLINK",
        role: "Governance spinal cord for MODX ecosystem",
        immutable_at_genesis: true,
        final_authority: "Constitution Article 10 (Founder)"
    }),

    // ---------------------------------------------
    // Enforcement
    // ---------------------------------------------
    enforcement: Object.freeze({
        zero_trust: true,
        anti_manipulation: true,
        ai_firewall: true,
        external_ai_isolation: true,
        corruption_shield: true
    }),

    timestamp: new Date().toISOString()
});
