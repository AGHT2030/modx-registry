// © 2025 AIMAL Global Holdings | PQC Safety Hashing

const crypto = require("crypto");

module.exports = {
    hashEvent(type, event) {
        const input = JSON.stringify({ type, event });
        return crypto.createHash("sha256").update(input).digest("hex");
    }
};
