// © 2025 AG Holdings Trust | MODX Sovereign Technologies
// Public Verification Endpoint (read-only)

"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const projectRoot = path.resolve(__dirname, "..", "..");
const freezeDir = path.join(projectRoot, "freeze_artifacts");

function latest(dir, prefix) {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix));
    if (!files.length) return null;
    files.sort((a, b) => b.localeCompare(a));
    return path.join(dir, files[0]);
}

router.get("/.well-known/modx/verify", (req, res) => {
    const cert = latest(freezeDir, "MODX_FREEZE_CERTIFICATE_");
    const manifest = latest(freezeDir, "MODX_GOVERNANCE_MANIFEST_");
    const verification = latest(freezeDir, "MODX_VERIFICATION_MANIFEST_");

    res.json({
        ok: true,
        protectedBy: "AGH_TRUST_IMMUTABILITY_LAYER",
        latest: {
            freezeCertificate: cert ? path.basename(cert) : null,
            governanceManifest: manifest ? path.basename(manifest) : null,
            verificationManifest: verification ? path.basename(verification) : null
        },
        mode: "READ_ONLY"
    });
});

module.exports = { router };
