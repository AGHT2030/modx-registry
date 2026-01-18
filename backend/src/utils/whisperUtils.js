
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

// backend/src/utils/whisperUtils.js
// Helper for converting audio streams to buffers and feeding into AURA transcriptions

const fs = require("fs");

async function bufferFromAudio(reqFile) {
    if (!reqFile) throw new Error("No audio file provided");
    return fs.createReadStream(reqFile.path);
}

module.exports = { bufferFromAudio };
