const express = require("express");
const router = express.Router();

router.get("/event/:eventId", require("./guestPortal.routes"));
router.get("/coordinator/:eventId", require("./coordinatorConsole.routes"));

router.post("/timeline/:eventId", require("./eventTimeline.routes"));
router.post("/venue/:eventId", require("./venueTwin.routes"));

module.exports = router;
