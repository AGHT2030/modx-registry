// daoEventIntake.cjs
/**
 * A6 DAO Event Intake
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 */

const { normalizeHeatmap } = require("../normalizers/heatmapNormalizer.cjs");
const { normalizeTicker } = require("../normalizers/tickerNormalizer.cjs");
const { writeLedgerEntry } = require("../ledger/ledgerWriter.cjs");

async function ingestHeatmap(raw, source) {
    const event = normalizeHeatmap(raw, source);
    await writeLedgerEntry(event);
    return event;
}

async function ingestTicker(raw, source) {
    const event = normalizeTicker(raw, source);
    await writeLedgerEntry(event);
    return event;
}

module.exports = {
    ingestHeatmap,
    ingestTicker
};

const { normalizeHeatmap, normalizeTicker, normalizeGovernanceEvent } = require("../normalizers");

function handleHeatmapUpdate(data) {
    const normalized = normalizeHeatmap(data);
    // Store in DAO ledger
    storeInDAO(normalized);
}

function handleTickerUpdate(data) {
    const normalized = normalizeTicker(data);
    // Store in DAO ledger
    storeInDAO(normalized);
}

function handleGovernanceEvent(data) {
    const normalized = normalizeGovernanceEvent(data);
    // Store in DAO ledger
    storeInDAO(normalized);
}

module.exports = { handleHeatmapUpdate, handleTickerUpdate, handleGovernanceEvent };
