/**
 * © 2025 AG Holdings Trust | MODE Galaxy Router
 * Handles all MODE hybrid event operations:
 *  - EventPortal
 *  - GuestPortal
 *  - Pulse & BusinessPulse
 *  - VenueTwin
 *  - Run-of-Show Timeline Sync
 *  - Vendor Intake (WrapUp™)
 *  - Franchise & Licensing
 */

const express = require("express");
const router = express.Router();

const modeController = require("./modeController.cjs");
const vendorIntake = require("./services/vendorIntakeService.cjs");
const modeService = require("./modeService.cjs");

// ---------------------------------------------------------
// EVENT PORTAL
// ---------------------------------------------------------
router.get("/event/:eventId", modeController.loadEventPortal);

// Guest portal (QR codes for attendees)
router.get("/event/:eventId/guest", modeController.loadGuestPortal);

// Pulse Timeline (AURA + Hologram sync)
router.get("/event/:eventId/pulse", modeController.loadPulseTimeline);

// Business Pulse (corporate variation)
router.get("/event/:eventId/business-pulse", modeController.loadBusinessPulse);

// ---------------------------------------------------------
// VENUE TWIN MODE
// ---------------------------------------------------------
router.get("/event/:eventId/venue-twin", modeController.loadVenueTwin);

// ---------------------------------------------------------
// TIMELINE / RUN-OF-SHOW SYNC
// ---------------------------------------------------------
router.post("/event/:eventId/timeline/update", modeController.updateTimeline);
router.post("/event/:eventId/timeline/pause", modeController.pauseTimeline);
router.post("/event/:eventId/timeline/resume", modeController.resumeTimeline);

// ---------------------------------------------------------
// SCHEDULE CHANGE (Coordinator → Twin → Guests/Vendors)
// ---------------------------------------------------------
router.post("/event/:eventId/schedule-change", modeController.scheduleChange);

// ---------------------------------------------------------
// WRAPUP™ VENDOR INTAKE & MAPS
// ---------------------------------------------------------
router.post("/vendor/intake", vendorIntake.intakeVendor);
router.get("/vendor/:vendorId/maps", vendorIntake.getVendorMaps);

// ---------------------------------------------------------
// FRANCHISE / LICENSING
// ---------------------------------------------------------
router.get("/franchise", modeController.loadFranchiseCenter);
router.post("/franchise/payment", modeController.processFranchisePayment);

// ---------------------------------------------------------
module.exports = router;
