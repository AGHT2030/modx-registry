/**
 * TIF Ingestion Pipeline
 * Normalizes events into threat packets
 */

const ThreatTypes = require("./threatTypes");
const Severity = require("./severityMap");

function createPacket(source, wallet, type = ThreatTypes.UNKNOWN, details = {}) {
    return {
        timestamp: Date.now(),
        source,       // "AURA", "AIRS", "MODLINK", "XRPL", "WALLET"
        wallet,
        type,
        severity: Severity.LOW,
        details
    };
}

module.exports = {
    createPacket
};
