/**
 * MOVE Hybrid Router → funnels MOVE traffic into AIRS Hybrid.
 */

const { runAIRS } = require("../../modx/hybrids/AIRS_Hybrid.cjs");

async function routeMoveHybrid(event = {}) {
    // event.mode decides which lane (standardRide / safeZoneRescue / pinMyFivePanic / aiRescue)
    return runAIRS(event);
}

module.exports = {
    routeMoveHybrid
};
