/**
 * PQC MFA Signer
 * Attaches quantum-safe signatures to MFA packets.
 */

const PQC = require("./PQC_Engine.cjs");

module.exports = {
    signMFAPacket(body) {
        const digest = PQC.digest(JSON.stringify(body));
        const sig = PQC.sign(digest);
        return { digest, sig };
    },

    verifyMFAPacket(body, clientSig) {
        const digest = PQC.digest(JSON.stringify(body));
        return PQC.verify(digest, clientSig);
    }
};
