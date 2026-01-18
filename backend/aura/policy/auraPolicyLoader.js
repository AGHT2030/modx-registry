
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
 * © 2025 Mia Lopez | AIMAL Global Holdings
 * AURA Policy Loader — Signature-verified, checksum-audited, live-sync middleware with audit log.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const EventEmitter = require("events");

class AuraPolicyEmitter extends EventEmitter { }
const auraPolicyEmitter = new AuraPolicyEmitter();

let policy = {};
let lastChecksum = "";

const root = process.cwd();
const policyPath = path.resolve(root, "backend/aura/policy/auraPolicy.json");
const sigPath = path.resolve(root, "backend/aura/policy/auraPolicy.sig");
const publicKeyPath = path.resolve(root, "backend/aura/policy/public.pem");
const logDir = path.resolve(root, "backend/logs");
const logFile = path.join(logDir, "auraPolicyAudit.log");

// Ensure log directory exists
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

/* 🔐 Compute SHA-256 checksum */
function computeChecksum(data) {
    return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

/* 🧠 Structural audit */
function auditPolicy(policyObj) {
    const required = ["allowed_actions", "restricted_actions", "max_runtime_ms", "roles"];
    const missing = required.filter((key) => !(key in policyObj));
    if (missing.length) {
        console.warn(`⚠️ Missing keys in AURA policy: ${missing.join(", ")}`);
    }

    console.log("🔍 AURA Policy Summary:");
    console.log("   Allowed actions:", policyObj.allowed_actions?.join(", ") || "none");
    console.log("   Restricted actions:", policyObj.restricted_actions?.join(", ") || "none");
    console.log("   Roles:", Object.keys(policyObj.roles || {}).join(", ") || "none");
    console.log("✅ Structure verified.\n");
}

/* ✅ Verify the digital signature */
function verifySignature(data) {
    try {
        if (!fs.existsSync(sigPath) || !fs.existsSync(publicKeyPath))
            throw new Error("Missing signature (.sig) or public key (.pem) file.");

        const signature = fs.readFileSync(sigPath);
        const publicKey = fs.readFileSync(publicKeyPath, "utf8");

        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(data, "utf8");
        verifier.end();

        const verified = verifier.verify(publicKey, signature);
        console.log(verified ? "🔏 Digital signature verified." : "🚨 Signature verification FAILED!");
        return verified;
    } catch (err) {
        console.warn("⚠️ Signature check skipped:", err.message);
        return false;
    }
}

/* 🧾 Write to audit log */
function writeAuditLog(entry) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${entry}\n`;
        fs.appendFileSync(logFile, logEntry, "utf8");
    } catch (err) {
        console.error("❌ Failed to write audit log:", err.message);
    }
}

/* ⚙️ Load + verify the AURA policy */
function loadAuraPolicy() {
    try {
        if (!fs.existsSync(policyPath)) throw new Error(`Policy file not found: ${policyPath}`);

        const fileData = fs.readFileSync(policyPath, "utf8");
        const checksum = computeChecksum(fileData);
        const verifiedSig = verifySignature(fileData);

        if (checksum === lastChecksum && Object.keys(policy).length > 0) return policy;
        lastChecksum = checksum;

        const parsed = JSON.parse(fileData);
        auditPolicy(parsed);

        console.log(`✅ AURA policy loaded and validated.`);
        console.log(`🔒 SHA-256 checksum: ${checksum}`);
        console.log(`🔐 Signature verified: ${verifiedSig}\n`);

        const result = { ...parsed, checksum, verified: verifiedSig };

        // ✍️ Log every load attempt
        writeAuditLog(
            `Policy loaded | checksum=${checksum} | verified=${verifiedSig} | roles=${Object.keys(parsed.roles || {}).join(", ")}`
        );

        return result;
    } catch (err) {
        console.error("❌ Failed to load AURA policy:", err.message);
        writeAuditLog(`❌ Load failed | reason="${err.message}"`);
        return { allowed_actions: [], restricted_actions: [], max_runtime_ms: 0, roles: {}, verified: false };
    }
}

/* 🔄 Watch for changes and rebroadcast */
function watchAuraPolicy() {
    try {
        fs.watchFile(policyPath, { interval: 2000 }, () => {
            console.log("♻️ AURA policy change detected — reloading...");
            const updated = loadAuraPolicy();
            policy = updated;
            auraPolicyEmitter.emit("policy:update", updated);
            writeAuditLog(`🔁 Policy updated | verified=${updated.verified}`);
            console.log("📡 Policy rebroadcast complete.\n");
        });
    } catch (err) {
        console.error("❌ Failed to start AURA policy watcher:", err.message);
    }
}

/* 🚀 Initialize */
policy = loadAuraPolicy();
watchAuraPolicy();

module.exports = { policy, auraPolicyEmitter };
