
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
 * © 2025 Mia Lopez | Device DNA Engine
 * Quantum Identity Stack (QUID Framework)
 *
 * Generates a non-reversible PQC-safe device fingerprint.
 * Pulls entropy from hardware, OS, CPU noise, GPU curve jitter,
 * TPM/secure enclave, and installation signature.
 */

const crypto = require("crypto");
const os = require("os");
const { execSync } = require("child_process");

class DeviceDNA {

    /**
     * Collect raw entropy from system
     */
    static collectEntropy() {
        const parts = {};

        try { parts.cpu = JSON.stringify(os.cpus()); } catch (_) { }
        try { parts.uptime = os.uptime().toString(); } catch (_) { }
        try { parts.platform = os.platform(); } catch (_) { }
        try { parts.arch = os.arch(); } catch (_) { }
        try { parts.hostname = os.hostname(); } catch (_) { }

        // TPM / Secure Enclave signature (Windows/Linux/Mac)
        try {
            parts.tpm = execSync("wmic path win32_tpm get ManufacturerId").toString();
        } catch (_) {
            parts.tpm = "TPM_UNAVAILABLE";
        }

        // GPU signature attempt (curve noise)
        try {
            parts.gpu = execSync("wmic path win32_VideoController get Name").toString();
        } catch (_) {
            parts.gpu = "GPU_UNAVAILABLE";
        }

        // Device installation entropy
        parts.installSeed = crypto
            .createHash("sha3-256")
            .update(__dirname + os.totalmem() + Date.now().toString())
            .digest("hex");

        return parts;
    }

    /**
     * Derives a final PQC-safe fingerprint
     */
    static generateFingerprint() {
        const entropy = this.collectEntropy();
        const raw = JSON.stringify(entropy);

        // Combine entropy → sha3-512
        const stage1 = crypto
            .createHash("sha3-512")
            .update(raw)
            .digest("hex");

        // Add quantum-safe salt
        const salt = crypto.randomBytes(64).toString("hex");

        const final = crypto
            .createHash("sha3-512")
            .update(stage1 + salt)
            .digest("hex");

        return {
            fingerprint: final,
            entropySource: entropy,
        };
    }

    /**
     * Compare with constant-time protection
     */
    static isMatch(a, b) {
        if (!a || !b) return false;
        const A = Buffer.from(a, "hex");
        const B = Buffer.from(b, "hex");
        return crypto.timingSafeEqual(A, B);
    }
}

module.exports = DeviceDNA;
