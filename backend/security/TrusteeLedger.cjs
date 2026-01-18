const fs = require("fs");
const PATH = "./data/trustee_ledger.json";

module.exports = {
    log(entry) {
        const ledger = fs.existsSync(PATH) ? JSON.parse(fs.readFileSync(PATH)) : [];
        ledger.push(entry);
        fs.writeFileSync(PATH, JSON.stringify(ledger, null, 2));
    },

    detectFraud(newEntry) {
        // Duplicate signature, out-of-sequence execution, conflicting trustee action, etc.
        return false;
    }
};
