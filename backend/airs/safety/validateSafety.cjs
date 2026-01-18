// © 2025 AIMAL Global Holdings | AIRS Safety Validation

const sitLog = require("../../sit/sitIncidentLog");
const pqc = require("../../security/pqc/pqcSafety");

module.exports = {
    async checkIntegrity(event) {
        const recalculated = pqc.hashEvent(event.action, event);
        return {
            valid: recalculated === event.pqcHash,
            expected: recalculated,
            provided: event.pqcHash
        };
    },

    async validateLast(n = 5) {
        const entries = await sitLog.readLast(n);
        return Promise.all(entries.map(e => this.checkIntegrity(e)));
    }
};
