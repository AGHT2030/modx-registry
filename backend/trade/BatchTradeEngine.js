/**
 * Handles multi-trade execution for funds + large investors
 */

module.exports = {
    async batchExecute(trades, executor) {
        const results = [];

        for (const t of trades) {
            try {
                const r = await executor(t);
                results.push({ ...t, status: "SUCCESS", tx: r.transactionHash });
            } catch (err) {
                results.push({ ...t, status: "FAILED", error: err.message });
            }
        }

        return results;
    }
};
