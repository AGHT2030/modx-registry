// © 2025 AIMAL Global Holdings | PQC Audit Logger
// Provides quantum-secure logging of governance state transitions.

const pqc = require("../../security/pqc_shield.cjs");

module.exports = {
    log(stage, payload) {
        const digest = pqc.hashEvent(`GOV_${stage}`, payload);
        console.log(`🛡 PQC AUDIT (${stage})`, digest);
    }
};
