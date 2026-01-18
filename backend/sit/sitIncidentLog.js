// © 2025 AIMAL Global Holdings | SIT Incident Log
// Immutable safety incident ledger for AIRS + hotel + MODE

const fs = require("fs");
const path = require("path");

const LOG_PATH = path.join(__dirname, "sit_incidents.log");

module.exports = {
    async write(event) {
        const line = JSON.stringify(event) + "\n";
        fs.appendFileSync(LOG_PATH, line);
    }
};
