module.exports = function scoreXRPL(metrics) {
    const weights = {
        uptime: 0.35,
        latency: 0.25,
        determinism: 0.20,
        pqc: 0.20
    };

    return (
        metrics.uptime * weights.uptime +
        metrics.latency * weights.latency +
        metrics.determinism * weights.determinism +
        metrics.pqc * weights.pqc
    );
};
