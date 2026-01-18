
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

const crypto = require("crypto");
const Property = require("../../database/models/Property");

module.exports = async function verifySignature(req, res, next) {
    const signature = req.headers["x-modastay-signature"];
    const propertyId = req.headers["x-modastay-property"];
    const licenseKey = req.headers["x-modastay-license"];

    if (!propertyId || !licenseKey || !signature) {
        return res.status(401).json({ ok: false, error: "Missing franchise credentials." });
    }

    const property = await Property.findOne({ propertyId, licenseKey });

    if (!property) {
        return res.status(403).json({ ok: false, error: "Invalid property or license key." });
    }
    if (property.status !== "active") {
        return res.status(403).json({ ok: false, error: `Property is ${property.status}.` });
    }

    // Hash body for signature
    const bodyHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(req.body || {}))
        .digest("hex");

    let verified = false;

    // Try each active public key
    for (const key of property.publicKeys.filter(k => !k.revoked)) {
        try {
            const verify = crypto.createVerify("RSA-SHA256");
            verify.update(bodyHash);
            verify.end();

            if (verify.verify(key.key, signature, "base64")) {
                verified = true;
                break;
            }
        } catch (err) { }
    }

    if (!verified) {
        return res.status(401).json({ ok: false, error: "Signature verification failed." });
    }

    req.property = property;
    next();
};
