const { io } = require("../aura/aura-spectrum");

module.exports = function bridgeListener(contract) {
    contract.on("PulseSignal", (proposalId, voter) => {
        io.emit("pulse:identity:signal", { proposalId, voter });
    });

    contract.on("SentinelSignal", (proposalId, risk) => {
        io.emit("sentinel:alert", { proposalId, risk });
    });

    contract.on("PolicySignal", (proposalId, advisory) => {
        io.emit("policy:advisor:update", { proposalId, advisory });
    });

    contract.on("GalaxySignal", (proposalId, galaxy) => {
        io.emit("galaxy:signal", { proposalId, galaxy });
    });
};
