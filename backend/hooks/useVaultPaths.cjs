
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

// © 2025 AIMAL Global Holdings | Vault Path Resolver
// Standardizes paths for AGVault directories (Trust + Investment + Fidelity + DAO Logs)

const path = require("path");
const fs = require("fs");

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    return p;
}

function getVaultPaths() {
    const baseVault = path.join("C:", "Users", "mialo", "AGVault");

    const paths = {
        baseVault,
        trust: ensureDir(path.join(baseVault, "trust")),
        daoLogs: ensureDir(path.join(baseVault, "trust", "dao_logs")),
        investment: ensureDir(path.join(baseVault, "investment")),
        fidelity: ensureDir(path.join(baseVault, "investment", "fidelity")),
        contracts: ensureDir(path.join(baseVault, "investment", "contracts")),
        reports: ensureDir(path.join(baseVault, "investment", "reports")),
        projects: ensureDir(path.join(baseVault, "investment", "projects")),
    };

    return paths;
}

module.exports = { getVaultPaths };
