
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

// routes/modeRoute.js
// © 2025 Mia Lopez | MODE Event Planning API (Secured)

const express = require("express");
const router = express.Router();
const MODE = require("../models/mode");
const protect = require("../middleware/protectRoutes");
const mfaVerify = require("../middleware/mfaVerify");
const geoLock = require("../middleware/geoLock");
const auditLog = require("../utils/auditLog");

// Optional RBAC
const authorize = (roles = []) => {
  return (req, res, next) => {
    const userRole = req?.user?.role || "guest";
    if (!roles.includes(userRole)) {
      auditLog("🚫 Unauthorized access attempt", {
        user: req.user?.email,
        route: req.originalUrl,
        role: userRole,
      });
      return res
        .status(403)
        .json({ message: "❌ Forbidden: insufficient role" });
    }
    next();
  };
};

// 📝 POST /api/mode - Create booking
router.post("/", protect, mfaVerify, geoLock, async (req, res) => {
  try {
    const booking = new MODE(req.body);
    const saved = await booking.save();
    auditLog("📝 Booking Created", {
      user: req.user?.email,
      bookingId: saved._id,
    });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "❌ Booking failed", error: err.message });
  }
});

// 📋 GET /api/mode - Get all bookings
router.get(
  "/",
  protect,
  mfaVerify,
  geoLock,
  authorize(["admin", "creator"]),
  async (req, res) => {
    try {
      const data = await MODE.find().sort({ createdAt: -1 });
      auditLog("📋 Booking List Viewed", {
        user: req.user?.email,
        count: data.length,
      });
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "❌ Fetch failed", error: err.message });
    }
  },
);

// 🔍 GET /api/mode/:id - Get single booking by ID
router.get("/:id", protect, mfaVerify, async (req, res) => {
  try {
    const entry = await MODE.findById(req.params.id);
    if (!entry)
      return res.status(404).json({ message: "❌ Booking not found." });
    auditLog("🔍 Booking Fetched", {
      user: req.user?.email,
      bookingId: req.params.id,
    });
    res.json(entry);
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to fetch booking", error: err.message });
  }
});

// 🔁 PUT /api/mode/:id - Full update of booking
router.put(
  "/:id",
  protect,
  mfaVerify,
  geoLock,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const updated = await MODE.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated)
        return res
          .status(404)
          .json({ message: "❌ Booking not found for update." });
      auditLog("✏️ Booking Fully Updated", {
        user: req.user?.email,
        bookingId: req.params.id,
      });
      res.json(updated);
    } catch (err) {
      res
        .status(400)
        .json({ message: "❌ Full update failed", error: err.message });
    }
  },
);

// ✅ PATCH /api/mode/:id - Partial update of booking
router.patch("/:id", protect, mfaVerify, async (req, res) => {
  try {
    const updated = await MODE.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    auditLog("🛠️ Booking Partially Updated", {
      user: req.user?.email,
      bookingId: req.params.id,
    });
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "❌ Partial update failed", error: err.message });
  }
});

// ❌ DELETE /api/mode/:id - Delete booking
router.delete(
  "/:id",
  protect,
  mfaVerify,
  geoLock,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const deleted = await MODE.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      auditLog("🗑️ Booking Deleted", {
        user: req.user?.email,
        bookingId: req.params.id,
      });
      res.json({ message: "✅ Deleted", id: deleted._id });
    } catch (err) {
      res.status(500).json({ message: "❌ Delete failed", error: err.message });
    }
  },
);

module.exports = router;


