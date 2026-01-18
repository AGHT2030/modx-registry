
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

// backend/security/security.controller.js
const { RSAKey, Device, ComplianceLog } = require("./security.model");
const { rotateRSAKey } = require("./rsa/rsaRotate");

module.exports = {
    async getActiveKeys(req, res) {
        const list = await RSAKey.find({}).sort({ rotatedAt: -1 });
        res.json({ ok: true, list });
    },

    async rotateKey(req, res) {
        const { propertyId } = req.body;
        const key = await rotateRSAKey(propertyId);

        await ComplianceLog.create({
            event: "key.rotate",
            propertyId,
            details: { version: key.version }
        });

        res.json({ ok: true, key });
    },

    async banDevice(req, res) {
        const { deviceId, reason } = req.body;

        await Device.updateOne(
            { deviceId },
            { banned: true, bannedReason: reason, bannedAt: new Date() },
            { upsert: true }
        );

        res.json({ ok: true, deviceId, reason });
    },

    async listDevices(req, res) {
        const list = await Device.find({});
        res.json({ ok: true, list });
    }
};
