/**
 * AIRS Shield — mobility-grade protection layer
 * Required: MODX_Shield is commander
 */

const { MODX_Shield } = require("./MODX_Shield.cjs");

module.exports = {
    precheck(req) {
        MODX_Shield.assertTrusted("AIRS", req);

        if (!req.user)
            throw new Error("AIRS Shield: Missing authenticated user");

        // No coercion flags
        if (req.coercionDetected)
            throw new Error("AIRS Shield: User under duress");
    },

    postcheck(result) {
        MODX_Shield.log("AIRS-ROUTE", result);
        return true;
    }
};
