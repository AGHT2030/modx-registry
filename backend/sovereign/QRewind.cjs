/**
 * Quantum Rollback Engine — Phase III
 */

const PQC = require("../security/pqc/PQC_IntegrityEngine.cjs");

module.exports = {
    rollback() {
        const snapshot = PQC.getLastVerifiedSnapshot();
        if (!snapshot) throw new Error("No PQC snapshot available.");

        console.warn("⏳ Restoring PQC-verified state…");

        // Restore state (contracts, NAV, ledger data)
        global.LEDGER_STATE = snapshot.ledger;
        global.GOV_STATE = snapshot.gov;
        global.ETF_NAV = snapshot.nav;

        global.MODLINK?.emit("system:rollback", snapshot);

        return snapshot;
    }
};
