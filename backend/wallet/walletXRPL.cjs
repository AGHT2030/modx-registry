// © 2025 AIMAL Global Holdings | XRPL Wallet Safe Mode Layer
// --------------------------------------------------------------
// Adds:
//   • XRPL SAFE MODE
//   • Health monitor
//   • Fallback transfer (EVM redirect)
//   • Prevents crashes during pre-launch
// --------------------------------------------------------------

const XRPLClient = require("../xrpl/xrplClient.cjs");
const { checkHealth } = require("./xrplHealth.cjs");

const client = new XRPLClient();

// XRPL SAFE MODE FLAG
let XRPL_SAFE_MODE = false;

// --------------------------------------------------
// 🔍 Health Refresh
// --------------------------------------------------
async function refreshHealth() {
    try {
        const rpc = process.env.XRPL_RPC || client.endpoint;
        const health = await checkHealth(rpc);

        if (!health.ok) {
            console.warn("⚠ XRPL Health Check Failed → XRPL SAFE MODE ACTIVATED");
            XRPL_SAFE_MODE = true;
        } else {
            console.log("💠 XRPL Healthy:", health.status);
            XRPL_SAFE_MODE = false;
        }
    } catch (err) {
        console.warn("⚠ XRPL Health Toggle Error:", err.message);
        XRPL_SAFE_MODE = true;
    }
}

// Public accessor
function getSafeMode() {
    return XRPL_SAFE_MODE;
}

// --------------------------------------------------
// 🔧 Initialize connection
// --------------------------------------------------
module.exports.init = async () => {
    try {
        await client.connect();
        console.log("💠 XRPL Connected:", client.endpoint);
        XRPL_SAFE_MODE = false;
    } catch (err) {
        console.warn("❌ XRPL init failed — SAFE MODE ON");
        XRPL_SAFE_MODE = true;
    }
};

// --------------------------------------------------
// 🧩 Get Status
// --------------------------------------------------
module.exports.getXRPLStatus = async () => {
    return {
        connected: !XRPL_SAFE_MODE,
        mode: XRPL_SAFE_MODE ? "SAFE_MODE" : "LIVE",
        endpoint: client.endpoint
    };
};

// --------------------------------------------------
// 💰 Balance Lookup
// --------------------------------------------------
module.exports.getBalances = async (address) => {
    return client.getBalance(address);
};

// --------------------------------------------------
// 🔗 Trustline Creation (Safe Mode aware)
// --------------------------------------------------
module.exports.ensureTrustline = async (address, currency, issuer) => {
    if (XRPL_SAFE_MODE) {
        console.warn("⚠ Trustline skipped — XRPL SAFE MODE");
        return { safeMode: true };
    }

    return client.sendPayment({
        TransactionType: "TrustSet",
        Account: address,
        LimitAmount: {
            currency,
            issuer,
            value: "1000000000"
        }
    });
};

// --------------------------------------------------
// 💸 Standard XRPL Payment
// --------------------------------------------------
module.exports.sendXRPLPayment = async (tx) => {
    return client.sendPayment(tx);
};

// --------------------------------------------------
// 🔁 SAFE TRANSFER (fallback wrapper)
// --------------------------------------------------
module.exports.safeTransfer = async (params) => {
    // Refresh health before processing
    await refreshHealth();

    if (XRPL_SAFE_MODE) {
        return {
            ok: false,
            fallback: true,
            message: "XRPL offline — routed to EVM fallback layer."
        };
    }

    return module.exports.sendXRPLPayment(params);
};

// --------------------------------------------------
// Export helpers
// --------------------------------------------------
module.exports.refreshHealth = refreshHealth;
module.exports.XRPL_SAFE_MODE = getSafeMode;
