
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
 * © 2025 Mia Lopez | EVM Governance Listener (Tier-1 C4 Mode, PQC + MODLINK Hybrid)
 *
 * Monitors:
 *  - ERC20 Mint / Burn / Transfers (MODX, MODA, MODUSDs, INTI)
 *  - Governance: ProposalCreated, VoteCast, RoleGranted, RoleRevoked…
 *  - Liquidity + tokenomics events
 *
 * Feeds → Sentinel → C5 Threat Engine → Policy Advisor → AURA Twins
 *          → Compliance Inbox → MODLINK Hybrid Bridge (C4)
 */

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

/* -------------------------------------------------------------
   🔐 PQC Hybrid Envelope (signs every governance packet)
------------------------------------------------------------- */
const { pqcWrapGovernancePayload } = require("../../pqc/pqc-envelope.js");

/* -------------------------------------------------------------
   🔭 MODLINK DAO Hybrid Bridge (C4 → UGW)
------------------------------------------------------------- */
const { ingestEVM } = require("./hybrid-governance-bridge.js");

/* -------------------------------------------------------------
   🔎 Sentinel / Advisor / C5 Threat Engine
------------------------------------------------------------- */
const sentinel = require("./outlierSentinel.cjs");
const advisor = require("./twinsPolicyAdvisor.cjs");
const { processC5 } = require("./c5-threat-processor.cjs");

/* -------------------------------------------------------------
   📩 Compliance Inbox
------------------------------------------------------------- */
const complianceBus = require("../../coinpurse/complianceInboxBus");

/* -------------------------------------------------------------
   🧾 Audit Log Engine
------------------------------------------------------------- */
const { auditLog } = require("../../admin/auditLogEngine");

/* -------------------------------------------------------------
   🌐 RPC Provider (auto-fallback for v5/v6)
------------------------------------------------------------- */
const RPC =
    process.env.EVM_RPC ||
    process.env.ALCHEMY_RPC_URL ||
    "https://polygon-rpc.com";

let provider;

try {
    provider = new ethers.providers.JsonRpcProvider(RPC);
    console.log(`🔗 EVM Governance Listener → Provider v5 loaded → ${RPC}`);
} catch (err) {
    try {
        provider = new ethers.JsonRpcProvider(RPC);
        console.log(`🔗 EVM Governance Listener → Provider v6 loaded → ${RPC}`);
    } catch (err2) {
        console.error("❌ Cannot initialize EVM RPC provider:", err2.message);
    }
}

/* -------------------------------------------------------------
   📦 ABI Loader
------------------------------------------------------------- */
function loadABI(name) {
    return JSON.parse(
        fs.readFileSync(path.join(__dirname, `abi/${name}.json`), "utf8")
    );
}

const ERC20_ABI = loadABI("erc20");
const GOVERNANCE_ABI = loadABI("governance");

/* -------------------------------------------------------------
   📌 Contract Registry
------------------------------------------------------------- */
const CONTRACT_ADDRESSES = {
    MODX: process.env.MODX_CONTRACT,
    MODA: process.env.MODA_CONTRACT,
    MODUSDs: process.env.MODUSDs_CONTRACT,
    INTI: process.env.INTI_CONTRACT,
    GOVERNANCE: process.env.EVM_GOVERNANCE_CONTRACT
};

/* -------------------------------------------------------------
   🏗️ Contract Initializer
------------------------------------------------------------- */
function setupContract(address, abi, label) {
    if (!address) {
        console.warn(`⚠️ ${label} contract missing from env.`);
        return null;
    }

    try {
        const c = new ethers.Contract(address, abi, provider);
        console.log(`🟣 Contract online → ${label} @ ${address}`);
        return c;
    } catch (err) {
        console.warn(`⚠️ Failed to init ${label}:`, err.message);
        return null;
    }
}

const Contracts = {
    MODX: setupContract(CONTRACT_ADDRESSES.MODX, ERC20_ABI, "MODX"),
    MODA: setupContract(CONTRACT_ADDRESSES.MODA, ERC20_ABI, "MODA"),
    MODUSDs: setupContract(CONTRACT_ADDRESSES.MODUSDs, ERC20_ABI, "MODUSDs"),
    INTI: setupContract(CONTRACT_ADDRESSES.INTI, ERC20_ABI, "INTI"),
    Governance: setupContract(
        CONTRACT_ADDRESSES.GOVERNANCE,
        GOVERNANCE_ABI,
        "Governance"
    )
};

/* -------------------------------------------------------------
   🧠 Core Unified EVM Processor
------------------------------------------------------------- */
async function processEVMEvent(label, eventName, args, event) {
    try {
        const packet = {
            chain: "EVM",
            contract: label,
            event: eventName,
            args,
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            timestamp: new Date().toISOString()
        };

        console.log(`⚡ EVM Governance Event [${label}] → ${eventName}`);

        // ⭐ AUDIT LOG
        auditLog({
            severity: "MEDIUM",
            source: `EVM Governance → ${label}`,
            message: `Event detected: ${eventName}`,
            details: packet
        });

        /* ---------------------------------------------------------
           1️⃣ Sentinel Risk Score
        --------------------------------------------------------- */
        const risk = await sentinel.evaluateImpact(packet, []);
        packet.risk = risk;

        /* ---------------------------------------------------------
           2️⃣ C5 Threat Engine
        --------------------------------------------------------- */
        await processC5(packet);

        /* ---------------------------------------------------------
           3️⃣ Policy Advisor / AURA Twins
        --------------------------------------------------------- */
        const advisory = await advisor.generateAdvisory(packet);
        packet.advisory = advisory;

        /* ---------------------------------------------------------
           4️⃣ Compliance Inbox
        --------------------------------------------------------- */
        complianceBus.push({
            source: "EVM",
            event: packet,
            advisory
        });

        /* ---------------------------------------------------------
           5️⃣ PQC-SEAL governance payload
        --------------------------------------------------------- */
        const sealed = pqcWrapGovernancePayload(packet);

        /* ---------------------------------------------------------
           6️⃣ MODLINK Hybrid Bridge → UGW
        --------------------------------------------------------- */
        ingestEVM(sealed);

        /* ---------------------------------------------------------
           7️⃣ AURA Twins broadcast (UI)
        --------------------------------------------------------- */
        if (global.io) {
            global.io.emit("evm:governance:event", sealed);
        }

    } catch (err) {
        console.error("❌ EVM event processing failed:", err.message);
    }
}

/* -------------------------------------------------------------
   🔄 ERC-20 Listeners (MODX / MODA / MODUSDs / INTI)
------------------------------------------------------------- */
function attachERC20(label, contract) {
    if (!contract) return;

    // Transfer
    contract.on("Transfer", (from, to, value, event) =>
        processEVMEvent(label, "Transfer", { from, to, value: value.toString() }, event)
    );

    // Approval
    contract.on("Approval", (owner, spender, value, event) =>
        processEVMEvent(
            label,
            "Approval",
            { owner, spender, value: value.toString() },
            event
        )
    );

    // Mint/Burn detection
    contract.on("Transfer", (from, to, value, event) => {
        if (from === ethers.constants.AddressZero)
            processEVMEvent(label, "Mint", { to, value: value.toString() }, event);

        if (to === ethers.constants.AddressZero)
            processEVMEvent(label, "Burn", { from, value: value.toString() }, event);
    });
}

/* -------------------------------------------------------------
   🏛️ Governance Listeners
------------------------------------------------------------- */
function attachGovernanceListeners(contract) {
    if (!contract) return;

    const govEvents = [
        "ProposalCreated",
        "ProposalQueued",
        "ProposalExecuted",
        "VoteCast",
        "RoleGranted",
        "RoleRevoked",
        "DelegateChanged",
        "Delegated"
    ];

    for (const evt of govEvents) {
        try {
            contract.on(evt, (...raw) => {
                const event = raw[raw.length - 1];
                const args = raw.slice(0, raw.length - 1);
                processEVMEvent("Governance", evt, args, event);
            });
            console.log(`🟣 Listening → Governance.${evt}`);
        } catch (err) {
            console.warn(`⚠️ Failed attaching listener for ${evt}:`, err.message);
        }
    }
}

/* -------------------------------------------------------------
   🚀 Start Listener
------------------------------------------------------------- */
function startEVMListener() {
    console.log("🚀 Starting Tier-1 EVM Governance Listener…");

    attachERC20("MODX", Contracts.MODX);
    attachERC20("MODA", Contracts.MODA);
    attachERC20("MODUSDs", Contracts.MODUSDs);
    attachERC20("INTI", Contracts.INTI);

    attachGovernanceListeners(Contracts.Governance);

    console.log("✅ EVM Governance Listener ACTIVE (PQC + MODLINK Hybrid)");
}

startEVMListener();

module.exports = { startEVMListener };
