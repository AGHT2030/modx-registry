/**
 * Sentinel C5 → Universe Router Threat Propagation Layer
 *
 * Maps threat levels to:
 *  - Router throttles
 *  - Governance cooldown windows
 *  - ETF mint/burn rate limits
 *  - Automatic propagation to all galaxies
 */

module.exports = {
    apply(threat) {
        switch (threat) {
            case "NORMAL":
                global.UNIVERSE = { throttle: 1, cooldown: 0, restricted: false };
                break;

            case "ELEVATED":
                global.UNIVERSE = { throttle: 0.75, cooldown: 1, restricted: false };
                break;

            case "HIGH":
                global.UNIVERSE = { throttle: 0.5, cooldown: 5, restricted: true };
                break;

            case "CRITICAL":
                global.UNIVERSE = { throttle: 0, cooldown: 10, restricted: true };
                global.LOCKDOWN = true;
                break;
        }

        console.log("🌌 Universe Router State Updated:", global.UNIVERSE);
    }
};
