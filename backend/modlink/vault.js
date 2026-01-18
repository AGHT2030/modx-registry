
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

// backend/modlink/vault.js
// © 2025 AIMAL Global Holdings | MODLINK Vault System
// AES-256-GCM encrypted vault manager for DAO-scoped secrets
// Supports encrypted secrets, fallback .env merge, and runtime rotation

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const logger = require("../../logger");

// ---------- Configuration ----------
const VAULT_PATH = path.join(__dirname, "vault.enc");
const VAULT_KEY =
    process.env.MODLINK_VAULT_KEY || "fallback-dev-key-change-immediately";
const algorithm = "aes-256-gcm";

// ---------- 🔐 Encrypt data to file ----------
function encryptVault(data) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            algorithm,
            Buffer.from(VAULT_KEY.padEnd(32)),
            iv
        );
        let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
        encrypted += cipher.final("base64");
        const authTag = cipher.getAuthTag().toString("base64");
        const payload = { iv: iv.toString("base64"), authTag, encrypted };
        fs.writeFileSync(VAULT_PATH, JSON.stringify(payload, null, 2));
        logger.info("🔒 MODLINK Vault encrypted and saved.");
    } catch (err) {
        logger.error("❌ Vault encryption failed:", err);
    }
}

// ---------- 🔓 Decrypt from file ----------
function decryptVault() {
    try {
        if (!fs.existsSync(VAULT_PATH)) {
            logger.warn("⚠️ No vault file found — returning empty object.");
            return {};
        }

        const payload = JSON.parse(fs.readFileSync(VAULT_PATH, "utf8"));
        const decipher = crypto.createDecipheriv(
            algorithm,
            Buffer.from(VAULT_KEY.padEnd(32)),
            Buffer.from(payload.iv, "base64")
        );
        decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
        let decrypted = decipher.update(payload.encrypted, "base64", "utf8");
        decrypted += decipher.final("utf8");

        const parsed = JSON.parse(decrypted);
        logger.info("🔐 MODLINK Vault decrypted successfully.");
        return parsed;
    } catch (err) {
        logger.error("❌ Vault decryption failed:", err);
        return {};
    }
}

// ---------- 🧭 Load vault contents (merged with .env fallback) ----------
function loadVault() {
    try {
        const vaultData = decryptVault();

        // merge with environment for resilience
        const combined = {
            MONGO_URI: vaultData.MONGO_URI || process.env.MONGO_URI || "",
            PRIVATE_KEY: vaultData.PRIVATE_KEY || process.env.PRIVATE_KEY || "",
            ALCHEMY_RPC_URL:
                vaultData.ALCHEMY_RPC_URL || process.env.ALCHEMY_RPC_URL || "",
            ...vaultData,
            timestamp: new Date().toISOString(),
        };

        logger.info("🔑 MODLINK Vault loaded into runtime context.");
        return combined;
    } catch (err) {
        logger.error("❌ Error loading vault:", err);
        return {
            MONGO_URI: process.env.MONGO_URI || "",
            PRIVATE_KEY: process.env.PRIVATE_KEY || "",
            ALCHEMY_RPC_URL: process.env.ALCHEMY_RPC_URL || "",
        };
    }
}

// ---------- 🔁 Rotate key + re-encrypt ----------
function rotateVault(newKey) {
    try {
        const data = decryptVault();
        const oldKey = VAULT_KEY;
        process.env.MODLINK_VAULT_KEY = newKey;
        encryptVault(data);
        logger.info(
            `🔄 Vault key rotated from ${oldKey.slice(0, 6)}... to ${newKey.slice(0, 6)}...`
        );
    } catch (err) {
        logger.error("❌ Vault key rotation failed:", err);
    }
}

// ---------- 🧪 Quick self-test ----------
if (require.main === module) {
    const data = loadVault();
    console.log("Vault self-check loaded keys:", Object.keys(data));
}

module.exports = { encryptVault, decryptVault, loadVault, rotateVault };
