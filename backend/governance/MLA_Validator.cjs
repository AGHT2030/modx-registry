// © 2025 AIMAL Global Holdings | MLA Validation Engine

const registry = require("../modlink/dao/ETF_GovernanceRegistry.cjs");

module.exports = {
    validateAction(actionId, payload) {
        const rule = registry[actionId];
        if (!rule) {
            return { valid: false, error: "Unknown MLA Action-ID" };
        }

        // Validate required params
        for (let key in rule.params) {
            if (!(key in payload.params)) {
                return { valid: false, error: `Missing parameter: ${key}` };
            }
        }

        return { valid: true, domain: rule.domain, risk: rule.risk };
    }
};
