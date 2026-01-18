/**
 * © 2025 AG Holdings Trust | AIRS → MODE/MODA Hotel Emergency Bridge
 */

const { TwinOracle } = require("../core/twins/TwinOracle.cjs");
const { safeZones } = require("./AIRS_SafeZoneRegistry.cjs");

function findNearestSafeZone(lat, lng) {
    let best = null;
    let dist = Infinity;

    for (const z of safeZones) {
        const d =
            Math.pow(lat - z.lat, 2) +
            Math.pow(lng - z.lng, 2);

        if (d < dist) {
            dist = d;
            best = z;
        }
    }

    return best;
}

function generateHotelPreCheckIn(victimProfile) {
    return {
        reservationId: "AUTO-" + Date.now(),
        room: "SAFE-FLOOR",
        instructions: "Bypass lobby — twin assisted entrance.",
        foodCredit: 50,
        status: "Approved via AIRS Emergency Bridge",
        victimProfile
    };
}

function bridgeToHotel({ location, victimProfile }) {
    const nearest = findNearestSafeZone(location.lat, location.lng);

    const twin = TwinOracle.advise({
        purpose: "victim_assistance",
        profile: victimProfile
    });

    return {
        nearestSafeZone: nearest,
        preCheckIn: generateHotelPreCheckIn(victimProfile),
        twinAdvisor: twin
    };
}

module.exports = { bridgeToHotel };
