/**
 * TIF Router — for sending threat events
 */

const express = require("express");
const router = express.Router();

const { createPacket } = require("./ingestion");
const TIFEngine = require("./engine");

// POST /tif/report
router.post("/tif/report", async (req, res) => {
    const { source, wallet, type, details } = req.body;

    if (!wallet) {
        return res.status(400).json({ error: "wallet required" });
    }

    const packet = createPacket(source, wallet, type, details);
    const result = await TIFEngine.process(packet);

    res.json({
        status: "processed",
        packet: result
    });
});

// Health
router.get("/tif/health", (req, res) => {
    res.json({ status: "ok", service: "TIF Threat Engine Active" });
});

module.exports = router;
