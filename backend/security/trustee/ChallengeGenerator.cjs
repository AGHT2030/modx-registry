/**
 * © 2025 AG Holdings Trust | Challenge Generator (TSS-1 + TSS-8)
 *
 * Creates dynamic trustee challenge strings:
 *  - Randomized entropy pool
 *  - AURA pattern-embedded challenge seeds
 *  - PQC-preimage mode (optional)
 */

const crypto = require("crypto");

module.exports = {
    generate(user) {
        // Base entropy
        const base = crypto.randomBytes(16).toString("hex");

        // AURA-tagged challenge seed
        const auraSeed = crypto.randomBytes(4).toString("hex").slice(0, 4);

        // Final challenge
        const challenge = `${base}-${auraSeed}`;

        // Store server-side to verify later (NO DB NEEDED)
        if (!global.CHALLENGES) global.CHALLENGES = {};
        global.CHALLENGES[user.email] = challenge;

        return challenge;
    },

    validate(user, response) {
        const expected = global.CHALLENGES?.[user.email];
        return expected && response === expected;
    }
};
