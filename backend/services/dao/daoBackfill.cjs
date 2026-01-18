"use strict";

const fs = require("fs");
const path = require("path");
const { ledgerWriter } = require("./ledgerWriter.cjs"); // Import the writer to commit the backfilled data

const intakeQueuePath = process.env.INTAKE_QUEUE_PATH || "/mnt/c/Users/mialo/AGVault/investment/queue";
const committedPath = process.env.COMMITTED_PATH || "/mnt/c/Users/mialo/AGVault/investment/queue/committed";

// Read all staged intake files and process them
function backfill() {
    const stagedFiles = fs.readdirSync(intakeQueuePath).filter(file => file.includes("staged"));

    stagedFiles.forEach(file => {
        const filePath = path.join(intakeQueuePath, file);
        const fileData = fs.readFileSync(filePath, "utf-8");
        const intake = JSON.parse(fileData);

        // Here we use the ledgerWriter to write the commit to the ledger
        ledgerWriter(intake);

        // After backfilling, move the file to the committed folder
        const committedFilePath = path.join(committedPath, file);
        fs.renameSync(filePath, committedFilePath);
        console.log(`Backfilled and moved: ${file}`);
    });
}

backfill();  // Run backfill once
