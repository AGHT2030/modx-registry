const express = require("express");
const router = express.Router();
const XRPLLookup = require("../chains/xrpl/XRPLLookup.cjs");

router.get("/anchors", async (req, res) => {
    const { digest } = req.query;
    const anchors = await XRPLLookup(digest);
    res.json({ anchors });
});

module.exports = router;
