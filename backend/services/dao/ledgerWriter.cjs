"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Define the path to your ledger
const ledgerPath = process.env.DAO_LEDGER_PATH || "/mnt/c/Users/mialo/AGVault/dao/ledger";

// Utility to create a unique commit hash
function generateCommitHash(data) {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

// Function to write data to the ledger
function ledgerWriter(data) {
    const commitHash = generateCommitHash(data);

    // Prepare the data to be written
    const commitData = {
        timestamp: new Date().toISOString(),
        commitHash,
        data
    };

    // Define the commit file path
    const commitFilePath = path.join(ledgerPath, `commit-${Date.now()}-${commitHash}.json`);

    // Write to ledger
    fs.writeFileSync(commitFilePath, JSON.stringify(commitData, null, 2));
    console.log(`Written commit to ledger: ${commitFilePath}`);
}

module.exports = { ledgerWriter };

