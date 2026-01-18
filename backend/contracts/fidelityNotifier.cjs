
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

// © 2025 AIMAL Global Holdings | Fidelity / Custodian Notifier
// CommonJS (Node 18/20). Sends authenticated notifications to the custodian
// when (1) a project intake is stored and (2) a smart contract is deployed.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");
const { logEvent } = require("../hooks/useLogger.cjs");

// ─────────────────────────────────────────────────────────────
// ENV
// ─────────────────────────────────────────────────────────────
const CFG = {
    baseURL: (process.env.FIDELITY_API_BASE || "https://custodian.sandbox/api").trim(),
    apiKey: process.env.FIDELITY_API_KEY || "",
    apiSecret: process.env.FIDELITY_API_SECRET || "",
    accountId: process.env.FIDELITY_ACCOUNT_ID || "",
    sandbox: (process.env.FIDELITY_SANDBOX || "true").toLowerCase() === "true",
    timeoutMs: Number(process.env.FIDELITY_TIMEOUT_MS || 10000),
    maxRetries: Number(process.env.FIDELITY_MAX_RETRIES || 3),
};

// ─────────────────────────────────────────────────────────────
// HELPERS: signing, headers, retry
// ─────────────────────────────────────────────────────────────
function signPayload(routePath, method, bodyObj, ts) {
    const body = JSON.stringify(bodyObj || {});
    const preimage = [method.toUpperCase(), routePath, ts, body].join("|");
    return crypto.createHmac("sha256", CFG.apiSecret).update(preimage).digest("hex");
}

function buildHeaders(routePath, method, bodyObj) {
    const ts = Date.now().toString();
    const sig = signPayload(routePath, method, bodyObj, ts);
    return {
        "Content-Type": "application/json",
        "X-API-KEY": CFG.apiKey,
        "X-TS": ts,
        "X-SIG": sig,
        "X-ACCOUNT-ID": CFG.accountId,
        "X-ENV": CFG.sandbox ? "sandbox" : "production",
    };
}

async function withRetry(fn, label) {
    let lastErr;
    for (let i = 0; i < CFG.maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const ms = 400 * Math.pow(2, i);
            logEvent("warn", `${label} retry ${i + 1}/${CFG.maxRetries}`, { waitMs: ms, message: err.message });
            await new Promise((r) => setTimeout(r, ms));
        }
    }
    throw lastErr;
}

// ─────────────────────────────────────────────────────────────
// CORE: generic notify  (patched for local simulation mode)
// ─────────────────────────────────────────────────────────────
async function notifyCustodian(routePath, method, payload, idempotencyKey) {
    // LOCAL SIMULATION MODE — write to AGVault instead of API call
    if (CFG.baseURL === "file") {
        const simDir = path.resolve(process.cwd(), "AGVault/investment/fidelity");
        if (!fs.existsSync(simDir)) fs.mkdirSync(simDir, { recursive: true });
        const simFile = path.join(simDir, `FidelitySim_${Date.now()}.json`);
        fs.writeFileSync(simFile, JSON.stringify(payload, null, 2), "utf8");
        console.log("🔹 Simulated Fidelity write → local file created", { simFile });
        return { ok: true, simFile, simulated: true };
    }

    // Normal remote API call
    const urlPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
    const url = `${CFG.baseURL}${urlPath}`;
    const headers = {
        ...buildHeaders(urlPath, method, payload),
        "Idempotency-Key": idempotencyKey || crypto.randomUUID(),
    };

    return withRetry(async () => {
        const res = await axios({
            url,
            method,
            headers,
            data: payload,
            timeout: CFG.timeoutMs,
            validateStatus: (s) => s >= 200 && s < 300,
        });
        return res.data;
    }, `Custodian notify ${urlPath}`);
}

// ─────────────────────────────────────────────────────────────
// PUBLIC: Project Intake & Contract Deployment Notifiers
// ─────────────────────────────────────────────────────────────
async function notifyFidelityProjectIntake(params = {}) {
    const payload = {
        event: "project_intake",
        accountId: CFG.accountId,
        projectId: params.projectId,
        vaultFile: params.filePath,
        contentHash: params.hash || null,
        meta: {
            region: params.region || null,
            category: params.category || null,
            targetRaiseUSD: params.targetRaiseUSD || null,
            createdBy: params.createdBy || null,
            sandbox: CFG.sandbox,
        },
        timestamp: new Date().toISOString(),
    };

    const idem =
        params.hash ||
        crypto.createHash("sha256").update(`${params.projectId}|${params.filePath}`).digest("hex");

    logEvent("info", "Notify Custodian: Project Intake → queued", { projectId: params.projectId, idem });
    const data = await notifyCustodian("/v1/projects/intake", "POST", payload, idem);
    logEvent("success", "Notify Custodian: Project Intake → ok", { projectId: params.projectId });
    return data;
}

async function notifyFidelityContractDeployment(params = {}) {
    const payload = {
        event: "contract_deployment",
        accountId: CFG.accountId,
        projectId: params.projectId,
        chain: params.chain,
        contractAddress: params.contractAddress,
        txId: params.txId || null,
        artifactPath: params.artifactPath || null,
        artifactHash: params.hash || null,
        issuer: params.issuer || null,
        timestamp: new Date().toISOString(),
    };

    const keySeed = `${params.projectId}|${params.chain}|${params.contractAddress}|${params.txId || ""}`;
    const idem = params.hash || crypto.createHash("sha256").update(keySeed).digest("hex");

    logEvent("info", "Notify Custodian: Contract Deployment → queued", {
        projectId: params.projectId,
        chain: params.chain,
        contractAddress: params.contractAddress,
    });
    const data = await notifyCustodian("/v1/contracts/deployment", "POST", payload, idem);
    logEvent("success", "Notify Custodian: Contract Deployment → ok", {
        projectId: params.projectId,
        chain: params.chain,
        contractAddress: params.contractAddress,
    });
    return data;
}

module.exports = {
    notifyFidelityProjectIntake,
    notifyFidelityContractDeployment,
};
