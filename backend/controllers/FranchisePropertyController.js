
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
 * © 2025 Mia Lopez | AG Holdings / MODAStay / MODE / CoinPurse
 * Franchise Property Controller (Unified)
 */

const FranchiseProperty = require("../models/FranchiseProperty");
const crypto = require("crypto");

// =============== UTIL: Generate RSA Keypair (2048-bit) ===============
function generateRSA() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
    });

    return {
        publicKey: publicKey.export({ type: "pkcs1", format: "pem" }),
        privateKey: privateKey.export({ type: "pkcs1", format: "pem" })
    };
}

// =============== UTIL: Encrypt Private Key =========================
function encryptPrivateKey(privateKey) {
    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(process.env.RSA_ENCRYPT_KEY, "hex"),
        Buffer.alloc(16, 0) // IV = 0000...
    );

    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

// ===================================================================
// 1️⃣ CREATE NEW FRANCHISE PROPERTY
// ===================================================================
exports.createProperty = async (req, res) => {
    try {
        const payload = req.body;

        const property = await FranchiseProperty.create(payload);

        res.json({ ok: true, property });
    } catch (err) {
        console.error("❌ createProperty error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 2️⃣ GET ALL PROPERTIES
// ===================================================================
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await FranchiseProperty.find().sort({ createdAt: -1 });
        res.json({ ok: true, properties });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 3️⃣ GET SINGLE PROPERTY BY ID
// ===================================================================
exports.getPropertyById = async (req, res) => {
    try {
        const property = await FranchiseProperty.findOne({ propertyId: req.params.id });

        if (!property)
            return res.status(404).json({ ok: false, error: "Property not found" });

        res.json({ ok: true, property });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 4️⃣ UPDATE PROPERTY (CORE FIELDS)
// ===================================================================
exports.updateProperty = async (req, res) => {
    try {
        const updated = await FranchiseProperty.findOneAndUpdate(
            { propertyId: req.params.id },
            req.body,
            { new: true }
        );

        res.json({ ok: true, updated });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 5️⃣ DELETE PROPERTY
// ===================================================================
exports.deleteProperty = async (req, res) => {
    try {
        await FranchiseProperty.deleteOne({ propertyId: req.params.id });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 6️⃣ ISSUE RSA LICENSE
// ===================================================================
exports.issueRSALicense = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await FranchiseProperty.findOne({ propertyId: id });
        if (!property) return res.status(404).json({ ok: false, error: "Property not found" });

        const { publicKey, privateKey } = generateRSA();

        property.rsa.publicKey = publicKey;
        property.rsa.privateKeyEncrypted = encryptPrivateKey(privateKey);
        property.rsa.keyId = crypto.randomUUID();
        property.rsa.issuedAt = new Date();
        property.rsa.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        property.rsa.isActive = true;

        await property.save();

        res.json({
            ok: true,
            publicKey,
            keyId: property.rsa.keyId,
            expiresAt: property.rsa.expiresAt
        });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 7️⃣ ROTATE RSA KEY
// ===================================================================
exports.rotateRSAKey = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await FranchiseProperty.findOne({ propertyId: id });

        if (!property) return res.status(404).json({ ok: false, error: "Property not found" });

        const { publicKey, privateKey } = generateRSA();

        property.rsa.publicKey = publicKey;
        property.rsa.privateKeyEncrypted = encryptPrivateKey(privateKey);
        property.rsa.keyId = crypto.randomUUID();
        property.rsa.issuedAt = new Date();
        property.rsa.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        await property.save();

        res.json({ ok: true, keyId: property.rsa.keyId, publicKey });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 8️⃣ UPDATE GEO-FENCE
// ===================================================================
exports.updateGeoFence = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, radiusMeters, enabled } = req.body;

        const updated = await FranchiseProperty.findOneAndUpdate(
            { propertyId: id },
            {
                geoFence: {
                    enabled,
                    latitude,
                    longitude,
                    radiusMeters,
                    lastUpdated: new Date()
                }
            },
            { new: true }
        );

        res.json({ ok: true, updated });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 9️⃣ UPDATE MODE SETTINGS
// ===================================================================
exports.updateMODE = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        const updated = await FranchiseProperty.findOneAndUpdate(
            { propertyId: id },
            { MODE: payload },
            { new: true }
        );

        res.json({ ok: true, updated });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 🔟 UPDATE CONTRACT ADDRESSES
// ===================================================================
exports.updateContracts = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        const updated = await FranchiseProperty.findOneAndUpdate(
            { propertyId: id },
            { contracts: { ...payload, lastSync: new Date() } },
            { new: true }
        );

        res.json({ ok: true, updated });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 1️⃣1️⃣ ADD STAFF MEMBER
// ===================================================================
exports.addStaffMember = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await FranchiseProperty.findOneAndUpdate(
            { propertyId: id },
            { $push: { staff: req.body } },
            { new: true }
        );

        res.json({ ok: true, updated });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

// ===================================================================
// 1️⃣2️⃣ APPEND COMPLIANCE LOG REFERENCE
// ===================================================================
exports.appendComplianceLog = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await FranchiseProperty.findOneAndUpdate(
            { propertyId: id },
            {
                $push: {
                    complianceLogRefs: {
                        logId: req.body.logId,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        res.json({ ok: true, updated });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};
