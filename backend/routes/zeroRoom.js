const express = require("express");
const router = express.Router();

const requireTrustee = require("../middleware/requireTrustee");
const requireBioDigitalKey = require("../middleware/requireBioDigitalKey");
const AURA = require("../aura/AuraPresenceService.cjs");
const TIF = require("../aura/tif/TIF_Model.cjs");
const PQC = require("../security/pqc/PQC_IntegrityEngine.cjs");
const { logQuantumEvent } = require("../sentinel/QuantumSentinel.cjs");

router.get("/zeroroom",
    requireTrustee,
    requireBioDigitalKey,
    async (req, res) => {

        // 1) Drift
        const drift = AURA.classifyDrift(req.headers);
        if (drift !== "NORMAL") return res.status(403).json({ drift });

        // 2) Fingerprint
        const fp = TIF.verifyFingerprint(req.user, req.headers);
        if (fp !== "MATCH") return res.status(403).json({ fp });

        // 3) PQC Shield
        const pqc = PQC.verify();
        if (!pqc.verified) return res.status(401).json({ pqc });

        logQuantumEvent("ZERO_ROOM_ACCESS", {
            trustee: req.user.email,
            drift,
            fp
        });

        res.json({
            status: "AUTHORIZED",
            classified: true,
            payload: loadZeroRoomData()
        });
    }
);

module.exports = router;
