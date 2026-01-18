module.exports = function generateGovHeatmap() {
    const out = [];

    for (let i = 0; i < 144; i++) {
        out.push({
            color: "#4f46e5",
            intensity: Math.random()
        });
    }

    return out;
};
