/**
 * Governance Forensics Engine
 * Reconstructs cross-chain, cross-module governance activity into a replayable timeline.
 */

module.exports = {
    generateTimeline() {
        const timeline = [];

        (global.GOV_EVENTS_LOG || []).forEach(evt => {
            timeline.push({
                timestamp: new Date(evt.timestamp).toLocaleString(),
                type: evt.type,
                details: evt.details
            });
        });

        return timeline;
    }
};
