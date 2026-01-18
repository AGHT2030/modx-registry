// © 2025 AIMAL Global Holdings | System Health Telemetry Engine
// -------------------------------------------------------------
// Tracks XRPL, EVM, AURA, MODLINK, PQC, and SIT modules.
// Guarantees SAFE MODE heartbeat output for Pre-Launch stability.

module.exports = {
    getStatus() {
        return {
            timestamp: Date.now(),

            // XRPL
            xrpl: {
                connected: global.XRPL_STATUS?.connected || false,
                mode: global.XRPL_STATUS?.mode || "SAFE_MODE",
                endpoint: global.XRPL_STATUS?.endpoint || null
            },

            // EVM Wallet
            evm: {
                connected: global.EVM_STATUS?.connected || false,
                mode: global.EVM_STATUS?.mode || "SAFE_MODE",
                lastBlock: global.EVM_STATUS?.lastBlock || null
            },

            // AURA AI
            aura: {
                online: !!global.AURA,
                mode: global.AURA?.mode || "SAFE",
                drift: global.AURA?.driftDetected ? "DETECTED" : "NORMAL"
            },

            // MODLINK Governance / DAO Wormhole
            modlink: {
                online: !!global.MODLINK,
                mode: global.MODLINK?.mode || "SAFE",
                lastSync: global.MODLINK?.lastSync || null
            },

            // PQC Safe Mode
            pqc: {
                active: global.PQC_STATUS?.active || false,
                mode: global.PQC_STATUS?.mode || "SAFE"
            },

            // SIT Rail
            sit: {
                active: global.SIT_STATUS?.active || false,
                lastIncident: global.SIT_STATUS?.lastIncident || null
            }
        };
    }
};
