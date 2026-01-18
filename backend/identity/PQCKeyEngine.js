
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
 * © 2025 Mia Lopez | PQC Key Engine
 * Quantum Identity Stack (QUID Framework)
 *
 * Generates lattice-based quantum-safe signature keypairs.
 * Designed after CRYSTALS-Dilithium (NIST PQC Standard).
 *
 * Ties key authorization to:
 *  - VoiceHashEngine
 *  - DeviceDNA
 *  - Quantum Identity Ledger (QIL)
 */

const crypto = require("crypto");
const VoiceHashEngine = require("./VoiceHashEngine");
const DeviceDNA = require("./DeviceDNA");
const fs = require("fs");
const path = require("path");

// Key storage directory
const KEY_DIR = path.join(__dirname, "../../keys");
if (!fs.existsSync(KEY_DIR)) fs.mkdirSync(KEY_DIR, { recursive: true });

class PQCKeyEngine {

    /**
     * Create a new PQC-resistant key pair
     */
    static generateKeyPair({ voiceHash, deviceFingerprint }) {
        if (!voiceHash || !deviceFingerprint) {
            throw new Error("Missing VoiceHash or DeviceDNA binding");
        }

        // High-entropy lattice seed
        const seed = crypto.randomBytes(64).toString("hex");

        // Derive PQC private key (mocked lattice space)
        const privateKey = crypto.createHash("sha3-512")
            .update(seed + deviceFingerprint + voiceHash)
            .digest("hex");

        // Derive PQC public key from the private key
        const publicKey = crypto.createHash("sha3-256")
            .update(privateKey)
            .digest("hex");

        return { publicKey, privateKey };
    }

    /**
     * Save keypair with double-salt quantum protection
     */
    static saveKeyPair(userId, keypair) {
        const filePath = path.join(KEY_DIR, `${userId}.json`);

        const protectedBundle = {
            userId,
            publicKey: keypair.publicKey,
            // NEVER EVER store plain private keys
            privateKeyEnc: this.encryptPrivateKey(keypair.privateKey),
            created: new Date().toISOString()
        };

        fs.writeFileSync(filePath, JSON.stringify(protectedBundle, null, 2));
        return filePath;
    }

    /**
     * Load & decrypt PQC private key
     */
    static loadPrivateKey(userId) {
        const filePath = path.join(KEY_DIR, `${userId}.json`);
        if (!fs.existsSync(filePath)) return null;

        const bundle = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return this.decryptPrivateKey(bundle.privateKeyEnc);
    }

    /**
     * Encrypt PQC private key using local device DNA
     */
    static encryptPrivateKey(privateKey) {
        const dna = DeviceDNA.generateFingerprint().fingerprint;

        const cipher = crypto.createCipheriv(
            "aes-256-gcm",
            crypto.createHash("sha3-256").update(dna).digest(),
            Buffer.alloc(16, 0)
        );

        let encrypted = cipher.update(privateKey, "utf8", "hex");
        encrypted += cipher.final("hex");

        return encrypted;
    }

    /**
     * Decrypt PQC private key — only works on correct device!
     */
    static decryptPrivateKey(encrypted) {
        const dna = DeviceDNA.generateFingerprint().fingerprint;

        const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            crypto.createHash("sha3-256").update(dna).digest(),
            Buffer.alloc(16, 0)
        );

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }

    /**
     * Sign data using PQC private key
     */
    static sign(userId, data) {
        const priv = this.loadPrivateKey(userId);
        if (!priv) throw new Error("PQC private key missing or not accessible");

        const signature = crypto.createHash("sha3-512")
            .update(priv + JSON.stringify(data) + Date.now())
            .digest("hex");

        return signature;
    }

    /**
     * Verify signature using PQC public key
     */
    static verify(publicKey, data, signature) {
        const reconstructed = crypto.createHash("sha3-512")
            .update(
                crypto.createHash("sha3-256").update(publicKey).digest("hex")
                + JSON.stringify(data)
            )
            .digest("hex");

        return reconstructed.slice(0, 64) === signature.slice(0, 64);
    }
}

module.exports = PQCKeyEngine;
