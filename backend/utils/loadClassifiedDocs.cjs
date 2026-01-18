const fs = require("fs");
const path = require("path");

module.exports.loadClassifiedDocs = function () {
    const dir = path.join(__dirname, "../classified");
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir).map(name => ({
        name,
        path: `/classified/${name}`,
        restricted: true
    }));
};
