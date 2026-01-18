/**
 * © 2025 AIMAL | TIF Threat Intelligence Engine
 * Unified Threat Correlation across XRPL + EVM + MODX
 */

const { enrichThreatPacket } = require("./sitTIFBinder");
const ThreatTypes = require("./threatTypes");
const Severity = require("./severityMap");

module.exports = {
    /**
     * Main threat processor
     */
    async process(packet) {
        // 1. Identity Binding
        packet = await enrichThreatPacket(packet);

        // 2. Basic Scoring Rules
        if (packet.type === ThreatTypes.DRIFT_ANOMALY) {
            packet.severity = Math.max(packet.severity, Severity.MEDIUM);
        }

        if (packet.type === ThreatTypes.GOVERNANCE_ABUSE) {
            packet.severity = Math.max(packet.severity, Severity.HIGH);
        }

        if (packet.type === ThreatTypes.CLEARANCE_VIOLATION) {
            packet.severity = Math.max(packet.severity, Severity.CRITICAL);
        }

        // 3. Logging
        console.log("⚠️  TIF Threat Processed:", {
            wallet: packet.wallet,
            type: packet.type,
            severity: packet.severity,
            identity: packet.identity?.status || "none"
        });

        return packet;
    }
};
