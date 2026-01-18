/**
 * CrossChainMonitor — detects mismatches between Polygon + XRPL
 */

const xrpl = require("xrpl");
const ethers = require("ethers");
/**
 * CrossChainMonitor — detects mismatches between Polygon + XRPL
 */

module.exports = {
    async compareSupply(etfName, polygonContract, xrplIssuer, xrplCurrency) {
        const polySupply = await polygonContract.totalSupply();

        const client = new xrpl.Client("wss://s2.ripple.com");
        await client.connect();

        const xrplState = await client.getXrpBalance(xrplIssuer);

        client.disconnect();

        const diff = Math.abs(Number(polySupply) - Number(xrplState));

        if (diff > 0.001) {
            global.IO.emit("crosschain:alert", {
                etf: etfName,
                polygon: polySupply.toString(),
                xrpl: xrplState,
                diff
            });

            console.warn(
                `⚠️ CROSS-CHAIN ANOMALY: ${etfName} supply mismatch:`,
                polySupply.toString(), xrplState
            );

            return true;
        }

        return false;
    }
};

module.exports = {
    async compareSupply(etfName, polygonContract, xrplIssuer, xrplCurrency) {
        const polySupply = await polygonContract.totalSupply();

        const client = new xrpl.Client("wss://s2.ripple.com");
        await client.connect();

        const xrplState = await client.getXrpBalance(xrplIssuer);

        client.disconnect();

        const diff = Math.abs(Number(polySupply) - Number(xrplState));

        if (diff > 0.001) {
            global.IO.emit("crosschain:alert", {
                etf: etfName,
                polygon: polySupply.toString(),
                xrpl: xrplState,
                diff
            });

            console.warn(
                `⚠️ CROSS-CHAIN ANOMALY: ${etfName} supply mismatch:`,
                polySupply.toString(), xrplState
            );

            return true;
        }

        return false;
    }
};
