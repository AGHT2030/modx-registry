
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

module.exports = function verifyGeoFence(req, res, next) {
    const property = req.property;

    if (!property?.geoFence) return next(); // no geofence = skip

    const { lat, lng, radiusMeters } = property.geoFence;
    const reqLat = Number(req.headers["x-geo-lat"]);
    const reqLng = Number(req.headers["x-geo-lng"]);

    if (!reqLat || !reqLng) {
        return res.status(400).json({ ok: false, error: "Missing geo-coordinates." });
    }

    const dist = getDistanceMeters(lat, lng, reqLat, reqLng);
    if (dist > radiusMeters) {
        return res.status(403).json({
            ok: false,
            error: `Request outside allowed geofence. Distance=${dist}m, limit=${radiusMeters}m`
        });
    }

    next();
};

function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = deg(lat2 - lat1);
    const dLon = deg(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg(lat1)) * Math.cos(deg(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg(d) {
    return (d * Math.PI) / 180;
}
