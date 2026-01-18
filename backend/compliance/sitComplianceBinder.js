/**
 * © 2025 AIMAL Global Holdings | Compliance Inbox
 * SIT-Bound Compliance Enforcement Layer
 */

const IdentityRegistry = require("../identity/sitRegistry");

// ------------------------------------------------------
// validateIdentityForAction(wallet, action)
// ------------------------------------------------------
async function validateIdentityForAction(wallet, action) {
    const SIT = IdentityRegistry.SIT;

    if (!SIT) {
        return {
            allowed: false,
            reason: "SIT registry not initialized"
        };
    }

    try {
        const tokenId = await SIT.getIdentity(wallet);
        if (tokenId === 0n) {
            return {
                allowed: false,
                reason: "Identity not found"
            };
        }

        const metadata = await SIT.resolveTokenId(tokenId);

        // Role-based rule example (customizable)
        if (action.requiresClearance && metadata.clearance < action.requiresClearance) {
            return {
                allowed: false,
                reason: `Clearance too low for ${action.name}`
            };
        }

        return {
            allowed: true,
            tokenId: tokenId.toString(),
            metadata
        };

    } catch (err) {
        return {
            allowed: false,
            reason: "Identity validation error: " + err.message
        };
    }
}

module.exports = {
    validateIdentityForAction
};
