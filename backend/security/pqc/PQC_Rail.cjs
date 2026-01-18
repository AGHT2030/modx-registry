/**
 * PQC Identity Rail
 * Injects quantum-safe signatures into every privileged session.
 */

const PQC = require("./PQC_Engine.cjs");
const crypto = require("crypto");

module.exports = {
    signRequest(payload) {
        const nonce = crypto.randomBytes(8).toString("hex");
        const digest = PQC.digest(JSON.stringify({ payload, nonce }));
        const sig = PQC.sign(digest);
        return { nonce, digest, sig };
    },

    verifyRequest(payload, nonce, sig) {
        const digest = PQC.digest(JSON.stringify({ payload, nonce }));
        return PQC.verify(digest, sig);
    }
};
