/**
 * MODE Galaxy Controller
 */

const modeService = require("./modeService.cjs");
const vendorIntake = require("./services/vendorIntakeService.cjs");
const Schedule = require("./models/scheduleModel.js");

// ---------------------------------------------------------
// EVENT PORTAL
// ---------------------------------------------------------
module.exports.loadEventPortal = async (req, res) => {
    const { eventId } = req.params;
    const data = await modeService.getEventPortalData(eventId);
    res.json(data);
};

// Guest portal (attendee experience)
module.exports.loadGuestPortal = async (req, res) => {
    const { eventId } = req.params;
    const data = await modeService.getGuestPortalData(eventId);
    res.json(data);
};

// ---------------------------------------------------------
// PULSE TIMELINE
// ---------------------------------------------------------
module.exports.loadPulseTimeline = async (req, res) => {
    res.json(await modeService.getPulseTimeline(req.params.eventId));
};

module.exports.loadBusinessPulse = async (req, res) => {
    res.json(await modeService.getBusinessPulse(req.params.eventId));
};

// ---------------------------------------------------------
// VENUE TWIN
// ---------------------------------------------------------
module.exports.loadVenueTwin = async (req, res) => {
    res.json(await modeService.getVenueTwinData(req.params.eventId));
};

// ---------------------------------------------------------
// TIMELINE MANAGEMENT
// ---------------------------------------------------------
module.exports.updateTimeline = async (req, res) => {
    res.json(await modeService.updateRunOfShow(req.params.eventId, req.body));
};

module.exports.pauseTimeline = async (req, res) => {
    res.json(await modeService.pauseRunOfShow(req.params.eventId));
};

module.exports.resumeTimeline = async (req, res) => {
    res.json(await modeService.resumeRunOfShow(req.params.eventId));
};

// ---------------------------------------------------------
// SCHEDULE CHANGES (Coordinator → AURA Twin → Everyone)
// ---------------------------------------------------------
module.exports.scheduleChange = async (req, res) => {
    const { eventId } = req.params;
    const { message, newTime } = req.body;

    const result = await modeService.scheduleChange(eventId, { message, newTime });

    res.json(result);
};

// ---------------------------------------------------------
// FRANCHISE CENTER
// ---------------------------------------------------------
module.exports.loadFranchiseCenter = async (req, res) => {
    res.json({ ui: "MODE Franchise Center Ready" });
};

module.exports.processFranchisePayment = async (req, res) => {
    res.json(await modeService.processFranchisePayment(req.body));
};
