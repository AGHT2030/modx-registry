
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

// © 2025 AG Holdings Trust | MODAStay Franchise Admin API

const express = require("express");
const router = express.Router();

const Property = require("../database/models/Property");
const LicenseKey = require("../database/models/LicenseKey");

const verifyHQMasterKey = require("../security/hq/verifyHQMasterKey");
const { generateRSAKeyPair } = require("../security/rsa/rsaKeyManager");

// All routes require HQ authentication:
router.use(verifyHQMasterKey);

/* -----------------------------------------------------------
   1️⃣ ONBOARD PROPERTY (Initial Registration)
----------------------------------------------------------- */
router.post("/property/onboard", async (req, res) => {
    try {
        const { name, propertyId, allowedContracts, geoFence } = req.body;

        if (!name || !propertyId) {
            return res.status(400).json({ ok: false, error: "Missing name or propertyId." });
        }

        const licenseKey = crypto.randomUUID();

        const property = await Property.create({
            name,
            propertyId,
            licenseKey,
            allowedContracts: allowedContracts || [],
            geoFence: geoFence || null,
            publicKeys: []
        });

        res.json({
            ok: true,
            message: "Property onboarded.",
            propertyId,
            licenseKey
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* -----------------------------------------------------------
   2️⃣ ISSUE RSA KEY PAIR (For Property)
----------------------------------------------------------- */
router.post("/property/issueKey", async (req, res) => {
    try {
        const { propertyId, issuedTo } = req.body;

        const property = await Property.findOne({ propertyId });
        if (!property) return res.status(404).json({ ok: false, error: "Property not found." });

        const { publicKey, privateKey, fingerprint } =
            await generateRSAKeyPair(propertyId, issuedTo);

        // attach to property
        property.publicKeys.push({
            key: publicKey,
            createdAt: new Date(),
            expiresAt: null
        });
        await property.save();

        res.json({
            ok: true,
            propertyId,
            publicKey,
            privateKey,
            fingerprint,
            message: "RSA key pair issued."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* -----------------------------------------------------------
   3️⃣ ROTATE RSA KEY (New Key, Old Key Marked as Revoked)
----------------------------------------------------------- */
router.post("/property/rotateKey", async (req, res) => {
    try {
        const { propertyId, issuedTo } = req.body;

        const property = await Property.findOne({ propertyId });
        if (!property) return res.status(404).json({ ok: false, error: "Property not found." });

        // revoke active keys
        property.publicKeys.forEach(k => (k.revoked = true));

        const { publicKey, privateKey, fingerprint } =
            await generateRSAKeyPair(propertyId, issuedTo);

        property.publicKeys.push({
            key: publicKey,
            createdAt: new Date(),
            expiresAt: null
        });

        await property.save();

        await LicenseKey.updateMany(
            { propertyId },
            { rotatedAt: new Date() }
        );

        res.json({
            ok: true,
            message: "RSA Key Rotated.",
            publicKey,
            privateKey,
            fingerprint
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* -----------------------------------------------------------
   4️⃣ SUSPEND / REVOKE PROPERTY
----------------------------------------------------------- */
router.post("/property/updateStatus", async (req, res) => {
    try {
        const { propertyId, status } = req.body;

        if (!["active", "suspended", "revoked"].includes(status)) {
            return res.status(400).json({ ok: false, error: "Invalid status." });
        }

        const property = await Property.findOneAndUpdate(
            { propertyId },
            { status },
            { new: true }
        );

        res.json({
            ok: true,
            message: `Property ${propertyId} updated to ${status}.`,
            property
        });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* -----------------------------------------------------------
   5️⃣ UPDATE ALLOWED CONTRACTS
----------------------------------------------------------- */
router.post("/property/contracts", async (req, res) => {
    try {
        const { propertyId, allowedContracts } = req.body;

        const property = await Property.findOneAndUpdate(
            { propertyId },
            { allowedContracts },
            { new: true }
        );

        res.json({
            ok: true,
            message: "Allowed contracts updated.",
            property
        });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* -----------------------------------------------------------
   6️⃣ UPDATE GEO-FENCE
----------------------------------------------------------- */
router.post("/property/geofence", async (req, res) => {
    try {
        const { propertyId, geoFence } = req.body;

        const property = await Property.findOneAndUpdate(
            { propertyId },
            { geoFence },
            { new: true }
        );

        res.json({
            ok: true,
            message: "GeoFence updated.",
            property
        });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* -----------------------------------------------------------
   7️⃣ LIST ALL PROPERTIES
----------------------------------------------------------- */
router.get("/property/list", async (req, res) => {
    try {
        const properties = await Property.find();

        res.json({
            ok: true,
            total: properties.length,
            properties
        });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
