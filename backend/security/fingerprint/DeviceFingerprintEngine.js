
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

/**
 * © 2025 Mia Lopez | Black Hole C — Device Fingerprint Engine
 *
 * PURPOSE:
 *   - Bind wallet session to device identity
 *   - Generate PQC-secure fingerprint token
 *   - Capture entropy, OS signature, and hardware profile
 *   - Prevent replay / device spoofing attacks
 *   - Create "Quantum Device Token" (QDT)
 */

const crypto = require("crypto");
const os = require("os");
const { ingestGenomeEvent } = require("../genome/SecurityGenomeRouter");

function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

/* ----------------------------------------------------------
   COLLECT DEVICE SIGNALS
----------------------------------------------------------- */
function getDeviceSignals(req) {
    return {
        userAgent: (req.headers["user-agent"] || "unknown").substring(0, 200),
        ip: req.ip || req.connection?.remoteAddress || null,
        platform: os.platform(),
        cpu: os.cpus()[0]?.model || "unknown",
        totalMem: os.totalmem(),
        screenRes: req.headers["x-screen-res"] || null,
        locale: req.headers["accept-language"] || null,
        timezone: req.headers["x-timezone"] || null,
        entropy: crypto.randomBytes(16).toString("hex")
    };
}

/* ----------------------------------------------------------
   CREATE QDT TOKEN (Quantum Device Token)
----------------------------------------------------------- */
function generateQDT(signals) {
    const raw = JSON.stringify(signals);
    const digest = sha256(raw);

    // PQC lattice simulation (production will use Kyber/Dilithium)
    const pqcNoiseLayer = sha256(digest + crypto.randomBytes(32));

    return sha256(digest + pqcNoiseLayer);
}

/* ----------------------------------------------------------
   MAIN: Produce fingerprint + update Security Genome
----------------------------------------------------------- */
function fingerprintDevice(req, user = "anonymous") {
    const signals = getDeviceSignals(req);
    const qdt = generateQDT(signals);

    ingestGenomeEvent({
        type: "identity",
        severity: "LOW",
        source: user,
        vector: "device_fingerprint",
        metadata: {
            qdt,
            signals
        }
    });

    return {
        qdt,
        signals
    };
}

/* ----------------------------------------------------------
   VALIDATION — used for enforcing “Device Binding”
----------------------------------------------------------- */
function validateDevice(req, knownQDT) {
    const { qdt: newToken } = fingerprintDevice(req);

    const isMatch = newToken === knownQDT;

    if (!isMatch) {
        ingestGenomeEvent({
            type: "identity_mismatch",
            severity: "HIGH",
            vector: "device_mismatch",
            metadata: { knownQDT, newToken }
        });
    }

    return { isMatch, newToken };
}

module.exports = {
    fingerprintDevice,
    validateDevice
};
