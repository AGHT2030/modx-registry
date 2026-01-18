// © 2025 AIMAL Global Holdings | XRPL Health Monitor (Safe Launch Mode)

const xrpl = require("xrpl");

module.exports = {
    async checkHealth(rpcUrl) {
        try {
            const client = new xrpl.Client(rpcUrl);
            await client.connect();

            const serverInfo = await client.request({ command: "server_info" });
            await client.disconnect();

            return {
                ok: true,
                status: serverInfo.result.info.server_state,
                validated: serverInfo.result.info.validated_ledger?.seq
            };
        } catch (err) {
            return {
                ok: false,
                error: err.message
            };
        }
    }
};
