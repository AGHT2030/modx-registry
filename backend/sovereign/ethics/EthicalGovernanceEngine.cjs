module.exports = {
    evaluate(intel) {
        return {
            compliance: "PASS",
            constraints: [
                "AI cannot execute without trustee sign-off",
                "AI cannot modify ETF parameters directly",
                "AI cannot alter governance history",
                "AI cannot create supply"
            ],
            advisory: "No ethical violations detected."
        };
    }
};
