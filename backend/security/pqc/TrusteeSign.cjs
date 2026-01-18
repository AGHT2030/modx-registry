// © 2025 AG Holdings Trust | PQC Signing Wrapper
const pqc = require("./PQC_Engine.cjs");
const fs = require("fs");

module.exports = {
    signTrusteeAction(action) {
        const digest = pqc.digest(JSON.stringify(action));
        const signature = pqc.sign(digest);

        return {
            digest,
            signature,
            timestamp: Date.now(),
            trustee: action.trustee
        };
    }
};
