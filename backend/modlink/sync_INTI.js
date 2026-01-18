// © 2025 AG Holdings Trust | MODLINK Governance Sync

const MODLINK = global.MODLINK || {};
const dao = MODLINK.dao;

module.exports = function syncINTI() {
    if (!dao) {
        console.log("⚠️ MODLINK DAO not ready.");
        return;
    }

    const payload = {
        id: "INTI",
        address: "0x2e018041F6b0E314AeaAe6D50E541C974E67d9E9",
        wrapped: "0x645265CbCE45967e1EE3eD5c6b2b5c60BA1598Cf",
        oracle: "0x4Cafd2804cBc379303EBAC5e752Cd4393A70Bc49",
        category: "asset",
        galaxy: "INVEST",
        sentiment: "neutral",
    };

    dao.registerAsset(payload);

    console.log("🌐 MODLINK Sync → INTI Registered into governance mesh.");
};
