/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * CLASSIFIED BRIEFING ROOM ROUTE — FINAL UPGRADED VERSION
 *
 * Requirements for access:
 *  ✔ AGH_TRUSTEE role
 *  ✔ Bio-Digital Key (BDK)
 *  ✔ AURA Drift classification = NORMAL
 *  ✔ TIF Behavioral Fingerprint Match
 *  ✔ Device/Geo Integrity (TSS–4 / TSS–5)
 *  ✔ Quantum Sentinel logging + QSeal hash
 *  ✔ Classified Session Token (TSS–13)
 *  ✔ C5 Threat Propagation recording
 *
 * Violations increment C5 threat indexes + trigger TSS fallback.
 * All access is immutably logged in the Classified Ledger.
 */

const express = require("express");
const router = express.Router();

const requireTrustee = require("../middleware/requireTrustee");
const requireBioDigitalKey = require("../middleware/requireBioDigitalKey");

// Trust Intelligence Engines
const AURA = require("../aura/AuraPresenceService.cjs");
const TIF = require("../aura/tif/TIF_Model.cjs");
const C5 = require("../sentinel/C5_Engine.cjs");

// Support utilities
const GeoLock = require("../security/GeoLockValidator.cjs");
const DeviceIntegrity = require("../security/DeviceIntegrity.cjs");
const { loadClassifiedDocs } = require("../utils/loadClassifiedDocs.cjs");
const { logQuantumEvent, qseal } = require("../sentinel/QuantumSentinel.cjs");
const { recordLedgerEntry } = require("../classified/ClassifiedLedger.cjs");
const { issueClassifiedToken } = require("../classified/ClassifiedSessionToken.cjs");
const rateLimit = require("../middleware/classifiedRateLimiter");


// 🚨 Internal anomaly counter
let mildAnomalies = 0;


/* -----------------------------------------------------------
   🛡 CLASSIFIED BRIEFING ROOM (Trustee Only)
----------------------------------------------------------- */
router.get(
    "/classified",
    rateLimit,              // 0️⃣ Anti-automation / anti-scraping
    requireTrustee,         // 1️⃣ Trustee role required
    requireBioDigitalKey,   // 2️⃣ Bio Digital Key validation
    async (req, res) => {

        const user = req.user;

        /* ---------------------------------------------------
           3️⃣ DEVICE INTEGRITY (TSS-5)
        --------------------------------------------------- */
        const deviceOk = DeviceIntegrity.verify(req.headers);
        if (!deviceOk) {
            C5.increment("DEVICE_TAMPER");
            return res.status(403).json({
                status: "DEVICE_REJECTED",
                message: "Device integrity validation failed."
            });
        }

        /* ---------------------------------------------------
           4️⃣ GEO-LOCK VALIDATION (TSS-4)
        --------------------------------------------------- */
        const geoOk = GeoLock.verify(req);
        if (!geoOk) {
            C5.increment("GEO_ANOMALY");
            return res.status(403).json({
                status: "GEO_RESTRICTED",
                message: "Access from unauthorized geographic location."
            });
        }

        /* ---------------------------------------------------
           5️⃣ AURA Drift Verification (TSS-6)
        --------------------------------------------------- */
        const drift = AURA.classifyDrift(req.headers);

        if (drift !== "NORMAL") {
            mildAnomalies++;
            C5.increment("DRIFT_FLAG");

            // Auto-lock after repeated mild anomalies
            if (mildAnomalies >= 3) {
                return res.status(423).json({
                    status: "AUTO_LOCKDOWN",
                    message: "Multiple drift anomalies detected. Trustee locked out.",
                    drift
                });
            }

            return res.status(401).json({
                status: "DRIFT_ALERT",
                message: "AURA detected abnormal trustee behavioral cadence.",
                drift
            });
        }

        /* ---------------------------------------------------
           6️⃣ TIF Behavioral Fingerprint Match (TSS-7)
        --------------------------------------------------- */
        const fpMatch = TIF.verifyFingerprint(user, req.headers);
        if (fpMatch !== "MATCH") {
            C5.increment("FP_MISMATCH");

            return res.status(403).json({
                status: "FINGERPRINT_REJECTED",
                message: "Behavioral fingerprint mismatch detected.",
                fpMatch
            });
        }

        /* ---------------------------------------------------
           7️⃣ Load classified document manifest
        --------------------------------------------------- */
        const docs = loadClassifiedDocs();

        /* ---------------------------------------------------
           8️⃣ Issue Classified Session Token (TSS-13)
        --------------------------------------------------- */
        const classifiedToken = issueClassifiedToken({
            email: user.email,
            ts: Date.now(),
            drift,
            fp: fpMatch
        });

        /* ---------------------------------------------------
           9️⃣ Quantum Sentinel Logging (TSS-10)
        --------------------------------------------------- */
        const seal = qseal({
            trustee: user.email,
            accessed: docs.length,
            at: Date.now()
        });

        logQuantumEvent("CLASSIFIED_ACCESS", {
            trustee: user.email,
            docsUnlocked: docs.length,
            seal
        });

        /* ---------------------------------------------------
          🔟 Write access to immutable Classified Ledger
        --------------------------------------------------- */
        recordLedgerEntry({
            trustee: user.email,
            timestamp: Date.now(),
            drift,
            fpMatch,
            files: docs.map(d => d.name),
            qseal: seal
        });

        /* ---------------------------------------------------
           1️⃣1️⃣ SUCCESS → Grant Access
        --------------------------------------------------- */
        return res.json({
            status: "AUTHORIZED",
            message: "Welcome Trustee. Classified materials unlocked.",
            trustee: user.email,
            drift,
            fpMatch,
            token: classifiedToken,
            quantumSeal: seal,
            files: docs
        });
    }
);

module.exports = router;
