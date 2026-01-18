module.exports = {
    generateDrafts(intel) {
        return [
            {
                type: "GOVERNANCE",
                proposal: "Increase PQC sampling frequency by 10%.",
                justification: "Moderate drift variance detected."
            },
            {
                type: "SECURITY",
                proposal: "Enable restrictive mode for liquidity ops.",
                justification: "Minor arbitrage anomaly observed."
            }
        ];
    }
};
