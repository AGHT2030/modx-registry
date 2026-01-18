/**
 * © 2025 AG Holdings Trust | AIRS Twin Log System
 * Option C Logs: Ephemeral Twin Memory + Sealed Trustee Vault
 */

const fs = require("fs");
const path = require("path");

const VAULT = path.resolve("./backend/airs/vault");
if (!fs.existsSync(VAULT)) fs.mkdirSync(VAULT, { recursive: true });

let ephemeral = []; // wiped every 3 minutes by AURA twins

function logEphemeral(event) {
    ephemeral.push({
        event,
        timestamp: Date.now()
    });
}

function sealToVault(event) {
    const filePath = path.join(
        VAULT,
        `vault_${Date.now()}_${Math.random().toString(36).slice(2)}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(event, null, 2));
    return filePath;
}

function getEphemeral() {
    return ephemeral;
}

module.exports = {
    logEphemeral,
    sealToVault,
    getEphemeral
};
