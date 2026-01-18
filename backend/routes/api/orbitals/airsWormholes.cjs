/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * AIRS Wormhole API
 *
 * Exposes AIRS galaxy wormholes to frontend safely.
 */

const express = require("express");
const router = express.Router();

const { AIRS_WORMHOLES } = require("../../orbitals/airs_wormholes.cjs");

router.get("/airs/wormholes", (req, res) => {
    res.json(AIRS_WORMHOLES);
});

module.exports = router;
