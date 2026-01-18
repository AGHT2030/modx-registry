backend / governance / EVMUnifiedGovernanceListener.cj// © 2025 AG Holdings Trust | MODX Sovereign Governance
// Unified EVM Governance Listener (NO eth_newFilter)

const { Interface } = require("ethers");
const EventRouter = require("./governanceEventRouter");

module.exports = async function startUnifiedGovernance({
    provider,
    contracts,
    abiMap,
    logger = console
}) {
    const interfaces = {};

    for (const [name, abi] of Object.entries(abiMap)) {
        interfaces[name] = new Interface(abi);
    }

    const addresses = Object.values(contracts).map(a => a.toLowerCase());

    logger.info("🚀 Starting Unified EVM Governance Listener");
    logger.info("🛰️ Watching contracts:", addresses.length);

    provider.on(
        {
            address: addresses
        },
        log => {
            try {
                const contractName = Object.keys(contracts)
                    .find(k => contracts[k].toLowerCase() === log.address.toLowerCase());

                if (!contractName) return;

                const iface = interfaces[contractName];
                const parsed = iface.parseLog(log);

                EventRouter.route({
                    contract: contractName,
                    event: parsed.name,
                    args: parsed.args,
                    blockNumber: log.blockNumber,
                    txHash: log.transactionHash
                });

            } catch (err) {
                logger.warn("⚠️ Governance decode skipped:", err.message);
            }
        }
    );

    logger.info("✅ Unified Governance Listener ACTIVE");
};
