
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

// © 2025 AIMAL Global Holdings | MODLINK HA Consensus State Manager

const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const NAMESPACE = "modlink_ha";

const NODE_KEYS = {
    MODLINK: `${NAMESPACE}:hb_modlink`,
    XRPL: `${NAMESPACE}:hb_xrpl`,
    COINPURSE: `${NAMESPACE}:hb_coinpurse`,
};

module.exports = {
    NODE_KEYS,

    async updateHeartbeat(node) {
        await redis.set(NODE_KEYS[node], Date.now());
    },

    async getState() {
        const [modlinkTS, xrplTS, coinTS] = await redis.mget(
            NODE_KEYS.MODLINK,
            NODE_KEYS.XRPL,
            NODE_KEYS.COINPURSE
        );

        return {
            modlinkTS: modlinkTS ? Number(modlinkTS) : 0,
            xrplTS: xrplTS ? Number(xrplTS) : 0,
            coinTS: coinTS ? Number(coinTS) : 0,
        };
    }
};
