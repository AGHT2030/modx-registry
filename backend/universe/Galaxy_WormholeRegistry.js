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

// © 2025 AIMAL Global Holdings | Galaxy Wormhole Registry (CJS)
// Hybrid routing table for inter-galaxy orbital transfers.

const GalaxyWormholes = {
    list() {
        return {

            // ------------------------------------------------------
            // 🌌 ORIGINAL WORMHOLES (your existing config preserved)
            // ------------------------------------------------------
            "PLAY→SHOP": "SHOP",
            "SHOP→STAY": "STAY",
            "STAY→PLAY": "PLAY",
            "WORK→HEALTH": "HEALTH",
            "MOVE→SHOP": "SHOP",
            "COMMUNITY→GIVE": "GIVE",
            "BUILD→INVEST": "INVEST",
            "INVEST→BUILD": "BUILD",
            "FARM→COMMUNITY": "COMMUNITY",
            "LEARN→PLAY": "PLAY",

            // ------------------------------------------------------
            // 🚀 **NEW WORMHOLES — MOVE → AIRS Hybrid Activation**
            // ------------------------------------------------------

            /**
             * MOVE → AIRS
             * When the MOVE galaxy detects AIRS routing (emergency mobility,
             * rescue mode, PINMYFIVE-verified ride, or safe-zone activation),
             * the wormhole shifts routing away from standard MOVE adapters
             * and into the AIRS Hybrid Module.
             */
            "MOVE→AIRS": "AIRS",

            /**
             * AIRS → SAFEZONE
             * Automatically routes AIRS victim-rescue journeys into
             * the Safe-Zone orbital path, overriding all destination fields.
             */
            "AIRS→SAFEZONE": "SAFEZONE",

            /**
             * AIRS → MODE
             * After a safe-zone arrival, MODE handles safe-hotel check-in,
             * concierge-twin coordination, recovery workflows, and protected UX.
             */
            "AIRS→MODE": "MODE",

            /**
             * SAFEZONE → HEAL
             * Once stabilized, the user is optionally routed to MODH/HEAL
             * for recovery resources, nonprofit partner connections,
             * and wellness onboarding with Twins.
             */
            "SAFEZONE→HEAL": "HEAL"
        };
    }
};

module.exports = GalaxyWormholes;

