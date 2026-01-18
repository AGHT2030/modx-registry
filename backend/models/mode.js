
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

// models/mode.js
// © 2025 Mia Lopez | MODE Event Planning Schema

const mongoose = require("mongoose");

const modeSchema = new mongoose.Schema(
  {
    // Core Event Metadata
    type: { type: String, required: true }, // wedding, conference, gala
    clientName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    guestCount: { type: Number },
    location: { type: String },
    theme: { type: String },
    notes: { type: String },
    status: { type: String, default: "pending" }, // pending, confirmed, canceled

    // Logistics & Assignments
    organizer: { type: String }, // staff or AI assignment
    budget: { type: Number },
    vendors: [{ name: String, contact: String, service: String }],
    immersiveSetup: {
      type: Boolean,
      default: false,
    },
    requestedFeatures: {
      type: [String], // e.g. ['AR invite', 'Hologram host', '3D mapping']
    },

    // Lifecycle Tracking
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MODE", modeSchema);

