/**
 * © 2025 AIMAL Global Holdings | TIF Threat Engine
 * SIT Identity Fusion Module
 */

const IdentityRegistry = require("../identity/sitRegistry");

async function enrichThreatPacket(packet) {
    const { wallet } = packet;

    const SIT = IdentityRegistry.SIT;
    if (!SIT) {
        packet.identity = { status: "unavailable" };
        return packet;
    }

    try {
        const tokenId = await SIT.getIdentity(wallet);
        if (tokenId === 0n) {
            packet.identity = { status: "no-identity" };
            return packet;
        }

        const metadata = await SIT.resolveTokenId(tokenId);

        packet.identity = {
            status: "bound",
            tokenId: tokenId.toString(),
            role: metadata.role || "user",
            clearance: metadata.clearance || 0,
            metadata
        };

        // trustee-level identity automatically raises severity
        if (metadata.clearance >= 5) {
            packet.severity = Math.max(packet.severity, 7);
        }

        return packet;

    } catch (err) {
        packet.identity = { status: "error", reason: err.message };
        return packet;
    }
}

module.exports = {
    enrichThreatPacket
};
