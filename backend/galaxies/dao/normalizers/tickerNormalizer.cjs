// backend/galaxies/dao/normalizers/tickerNormalizer.cjs
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Normalizes incoming ticker price events.
 */
/**
 * A6 Ticker Normalizer
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 */


module.exports = function normalizeTickerEvent(event) {
    if (!event || !event.payload) {
        throw new Error("Invalid ticker event payload");
    }

    const { symbol, price, change, timestamp } = event.payload;

    // Normalize data (example)
    return {
        symbol: symbol || "UNKNOWN",
        price: parseFloat(price) || 0,
        change: parseFloat(change) || 0,
        timestamp: timestamp || new Date().toISOString()
    };

    function normalizeSymbol(sym = "") {
        return sym.toString().trim().toUpperCase();
    }

    function normalizeNumber(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }

    function normalizeTicker(raw = {}, source = "oracle") {
        return {
            type: "A6_TICKER_UPDATE",
            symbol: normalizeSymbol(raw.symbol || raw.id),
            price: normalizeNumber(raw.price ?? raw.usd),
            change24h: normalizeNumber(
                raw.change24h ??
                raw.usd_24h_change ??
                raw.change
            ),
            source,
            timestamp: raw.timestamp || new Date().toISOString()
        };
    }

    module.exports = {
        normalizeTicker
    };

};
