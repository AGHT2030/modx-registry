// © 2025 AIMAL Global Holdings | XRPL Safe Mode Client Wrapper
// GOVERNANCE-CRITICAL — FINAL STRUCTURE (FREEZE-SAFE)

const xrpl = require("xrpl");

/* ---------------------------------------------------------
   XRPL ENDPOINT POOL (ROTATION)
--------------------------------------------------------- */
const XRPL_ENDPOINTS = [
    process.env.XRPL_RPC,
    "wss://s1.ripple.com",
    "wss://s2.ripple.com",
    "wss://xrplcluster.com"
].filter(Boolean);

/* ---------------------------------------------------------
   JITTER (NON-INVASIVE)
--------------------------------------------------------- */
function jitter(base = 1000) {
    return base + Math.floor(Math.random() * 750);
}

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

module.exports = class XRPLClient {
    constructor(opts = {}) {
        this.endpoints = opts.endpoints || XRPL_ENDPOINTS;
        this.endpointIndex = 0;

        this.safeMode = true;     // Always boot safe
        this.degraded = false;    // Dashboard + trust scoring
        this.client = null;
        this.endpoint = null;
    }

    /* -----------------------------------------------------
       INTERNAL: rotate endpoint
    ----------------------------------------------------- */
    nextEndpoint() {
        this.endpointIndex =
            (this.endpointIndex + 1) % this.endpoints.length;
        return this.endpoints[this.endpointIndex];
    }

    /* -----------------------------------------------------
       CONNECT (ROTATION + JITTER)
    ----------------------------------------------------- */
    async connect() {
        for (let i = 0; i < this.endpoints.length; i++) {
            const endpoint = this.endpoints[i];

            try {
                this.endpoint = endpoint;
                this.client = new xrpl.Client(endpoint, {
                    connectionTimeout: 15000
                });

                await this.client.connect();

                this.safeMode = false;
                this.degraded = false;

                global.XRPL_READY = true;
                global.XRPL_CLIENT = this;
                global.XRPL_DEGRADED = false;

                console.log("🌐 XRPL Connected:", endpoint);
                return;
            } catch (err) {
                console.warn(`⚠ XRPL endpoint failed: ${endpoint}`);
                await sleep(jitter(750));
            }
        }

        // All endpoints failed
        this.safeMode = true;
        this.degraded = true;

        global.XRPL_READY = false;
        global.XRPL_DEGRADED = true;

        console.warn("❌ XRPL ALL endpoints failed — SAFE MODE");
    }

    /* -----------------------------------------------------
       READ (SAFE)
    ----------------------------------------------------- */
    async getBalance(address) {
        if (this.safeMode || !this.client) {
            return { xrp: "0", assets: [] };
        }

        try {
            return await this.client.getBalances(address);
        } catch {
            this.safeMode = true;
            this.degraded = true;
            global.XRPL_DEGRADED = true;
            return { xrp: "0", assets: [] };
        }
    }

    /* -----------------------------------------------------
       WRITE (BLOCKED IN SAFE MODE)
    ----------------------------------------------------- */
    async sendPayment(payload) {
        if (this.safeMode || !this.client) {
            console.warn("⚠ XRPL Payment blocked — SAFE MODE");
            return { safeMode: true };
        }

        try {
            return await this.client.submitAndWait(payload);
        } catch {
            this.safeMode = true;
            this.degraded = true;
            global.XRPL_DEGRADED = true;
            return { error: "XRPL_TX_FAILED", safeMode: true };
        }
    }

    async disconnect() {
        try {
            if (this.client) await this.client.disconnect();
        } catch { }
    }
};
