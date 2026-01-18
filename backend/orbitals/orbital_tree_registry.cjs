const superOrbs = require("./galaxy_super_orbs.cjs");
const subOrbs = require("./galaxy_sub_orbs.cjs");
const hybrids = require("./galaxy_hybrids.cjs");

module.exports = Object.freeze({
    superOrbs,
    subOrbs,
    hybrids,
    version: "2025.12.04",
    sovereign: "AG_Holdings_Trust",
    tree: {
        super: Object.keys(superOrbs),
        sub: Object.keys(subOrbs),
        hybrid: Object.keys(hybrids)
    }
});
