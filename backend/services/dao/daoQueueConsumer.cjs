"use strict";

const fs = require("fs");
const path = require("path");
const { ledgerWriter } = require("./ledgerWriter.cjs"); // Use the ledgerWriter to commit entries
const { isValidSignature } = require("../crypto/verify.cjs"); // Assuming a signature verification function is here

const intakeQueuePath = process.env.INTAKE_QUEUE_PATH || "/mnt/c/Users/mialo/AGVault/investment/queue";
const failedQueuePath = process.env.FAILED_QUEUE_PATH || "/mnt/c/Users/mialo/AGVault/investment/queue/failed";

// Watch for staged intake files and process them
function consumeQueue() {
    const stagedFiles = fs.readdirSync(intakeQueuePath).filter(file => file.includes("staged"));

    stagedFiles.forEach(file => {
        const filePath = path.join(intakeQueuePath, file);
        const fileData = fs.readFileSync(filePath, "utf-8");
        const intake = JSON.parse(fileData);

        // Verify signature before processing
        if (!isValidSignature(intake.signature)) {
            console.log(`Invalid signature for file: ${file}`);
            // Move to failed folder if invalid
            const failedFilePath = path.join(failedQueuePath, file);
            fs.renameSync(filePath, failedFilePath);
            return;
        }

        // Commit to ledger
        ledgerWriter(intake);

        // Move processed file to committed folder
        const committedFilePath = path.join(committedPath, file);
        fs.renameSync(filePath, committedFilePath);
        console.log(`Processed and moved: ${file}`);
    });
}

// Run every minute (or any interval you'd like)
setInterval(consumeQueue, 60000);

