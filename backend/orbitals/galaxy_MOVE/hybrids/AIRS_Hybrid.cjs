/**
 * AIRS Hybrid → Connects MOVE + HEAL + MODE + MODAStay
 * Handles:
 * - Secure mobility
 * - Emergency extraction
 * - Safe-zone routing
 * - PINMYFIVE verification
 * - Twin-only communications
 */

const AIRS_Shield = require("../../../security/shield/AIRS_Shield.cjs");
const SafeZones = require("../../../airs/AIRS_SafeZoneEngine.cjs");
const Cloak = require("../../../airs/AIRS_CloakEngine.cjs");
const RouteGuardian = require("../../../airs/AIRS_RouteGuardian.cjs");
const DriverVerify = require("../../../airs/AIRS_DriverVerification.cjs");

module.exports = {
    async dispatch(request = {}) {
        AIRS_Shield.precheck(request);

        // PINMYFIVE validation before ANY autonomous pickup
        await DriverVerify.PINMYFIVE(request);

        // Safe-zone extraction mode
        if (request?.mode === "victim_rescue") {
            return SafeZones.extract(request);
        }

        // Normal AIRS routing
        const cloaked = await Cloak.apply(request);
        const verified = await RouteGuardian.secureRoute(cloaked);

        AIRS_Shield.postcheck(verified);

        return verified;
    }
};
