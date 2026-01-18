/**
 * AURA Drift-Aware Challenge Sequencer
 * Generates difficulty tiers based on behavioral drift classification.
 */

const ChallengeGenerator = require("../../security/trustee/ChallengeGenerator.cjs");

module.exports = function sequencedChallenge(user, driftLevel) {
    let challenge = ChallengeGenerator.generate(user);

    switch (driftLevel) {
        case "NORMAL":
            return { challenge, level: "L1" };

        case "ANOMALY":
            // Harder challenge
            return {
                challenge: challenge + "-X",
                level: "L2"
            };

        case "ABSENT":
            // PQC-strength challenge requirement
            return {
                challenge: challenge + "-PQC-" + Date.now(),
                level: "L3"
            };

        case "CRITICAL":
            global.SENTINEL?.trigger("TRUSTEE_RISK_CRITICAL", { user });
            return {
                challenge: challenge + "-LOCKDOWN",
                level: "L4"
            };

        default:
            return { challenge, level: "L1" };
    }
};
