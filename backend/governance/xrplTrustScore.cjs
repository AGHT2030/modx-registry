module.exports = function scoreXRPL(metrics) {
    let score = 100;

    if (metrics.uptime < 99.5) score -= 25;
    if (!metrics.pqcSigned) score -= 30;
    if (metrics.flapping) score -= 20;
    if (!metrics.slaMet) score -= 25;

    return {
        score: Math.max(score, 0),
        level:
            score >= 90 ? "A" :
                score >= 75 ? "B" :
                    score >= 60 ? "C" : "NON-COMPLIANT"
    };
};
