/**
 * PINMYFIVE:
 * - User gives 5-digit ephemeral hash
 * - Driver must verbally return correct response
 * - Prevents impersonation or AI mimicry attacks
 */

const crypto = require("crypto");

module.exports = {
    async PINMYFIVE(req) {
        if (!req.pin)
            throw new Error("AIRS: PINMYFIVE missing");

        const expected = crypto
            .createHash("sha256")
            .update(req.user + "AIRS")
            .digest("hex")
            .slice(0, 5);

        if (req.pin !== expected)
            throw new Error("AIRS: PINMYFIVE mismatch");

        return true;
    }
};
