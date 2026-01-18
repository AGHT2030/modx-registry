const { Client } = require("xrpl");

const XRPL_ENDPOINTS = [
    "wss://s1.ripple.com",
    "wss://s2.ripple.com",
    "wss://xrplcluster.com",
    "wss://xrpl.ws"
];

let endpointIndex = 0;

async function connectXRPL() {
    while (endpointIndex < XRPL_ENDPOINTS.length) {
        const endpoint = XRPL_ENDPOINTS[endpointIndex];
        const client = new Client(endpoint, { connectionTimeout: 15000 });

        try {
            console.log(`🛰️ Connecting to XRPL → ${endpoint}`);
            await client.connect();

            global.XRPL_CLIENT = client;
            global.XRPL_READY = true;
            global.XRPL_ENDPOINT = endpoint;

            console.log("✅ XRPL CONNECTED:", endpoint);
            return;
        } catch (err) {
            console.warn(
                `⚠️ XRPL connect failed @ ${endpoint}: ${err.message}`
            );
            endpointIndex++;
        }
    }

    // HARD FAILOVER
    global.XRPL_READY = false;
    global.XRPL_DEGRADED = true;

    console.error("❌ XRPL ALL ENDPOINTS FAILED — DEGRADED MODE");
}

module.exports = { connectXRPL };
