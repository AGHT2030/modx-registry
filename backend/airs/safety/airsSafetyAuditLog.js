module.exports = {
    log(type, payload) {
        // Tier-2 safe no-op logger
        console.log(`🛡 AIRS AUDIT [${type}]`, payload ? "" : "");
    }
};
