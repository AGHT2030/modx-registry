/**
 * ADO — Executes Sovereign Command AI directives
 */

const ETFBreaker = require("../etf/ETF_CircuitBreaker.cjs");
const ArbitrageGuardian = require("../defense/ArbitrageGuardian.cjs");

module.exports = {
    async execute(urd) {
        switch (urd.directive) {
            case "ROLLBACK_AND_LOCKDOWN":
                console.warn("🔒 Phase III — FULL SYSTEM LOCKDOWN INITIATED");
                ETFBreaker.freezeAll();
                ArbitrageGuardian.freeze();
                global.ZERO_TRACE_MODE = true;
                global.MODLINK?.emit("system:lockdown", urd.payload);
                break;

            case "RESTRICT_OPERATIONS":
                console.warn("⚠️ High threat — restricting operations");
                ArbitrageGuardian.freeze();
                global.MODLINK?.emit("system:restricted", urd.payload);
                break;

            case "ALLOW":
                // Do nothing — system remains fully operational
                break;
        }
    }
};
