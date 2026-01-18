
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

/**
 * © 2025 Mia Lopez | AG Holdings / MODAStay / MODE / CoinPurse
 * Franchise Property Admin API Routes
 */

const express = require("express");
const router = express.Router();

const FranchisePropertyController = require("../../controllers/FranchisePropertyController");

// OPTIONAL: Only allow admin or system-level access
function adminAuth(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ ok: false, error: "Admin access required." });
    }
    next();
}

// ============================================================================
// 📌 1️⃣ CORE CRUD ROUTES
// ============================================================================
router.get("/", FranchisePropertyController.getAllProperties);

router.post("/", adminAuth, FranchisePropertyController.createProperty);

router.get("/:id", FranchisePropertyController.getPropertyById);

router.put("/:id", adminAuth, FranchisePropertyController.updateProperty);

router.delete("/:id", adminAuth, FranchisePropertyController.deleteProperty);

// ============================================================================
// 📌 2️⃣ RSA LICENSING ROUTES
// ============================================================================
router.post("/:id/rsa/issue", adminAuth, FranchisePropertyController.issueRSALicense);

router.post("/:id/rsa/rotate", adminAuth, FranchisePropertyController.rotateRSAKey);

// ============================================================================
// 📌 3️⃣ GEO-FENCE ROUTES
// ============================================================================
router.put("/:id/geofence", adminAuth, FranchisePropertyController.updateGeoFence);

// ============================================================================
// 📌 4️⃣ MODE Event Coordinator Licensing
// ============================================================================
router.put("/:id/mode", adminAuth, FranchisePropertyController.updateMODE);

// ============================================================================
// 📌 5️⃣ SMART CONTRACT Sync Routes
// ============================================================================
router.put("/:id/contracts", adminAuth, FranchisePropertyController.updateContracts);

// ============================================================================
// 📌 6️⃣ STAFF MANAGEMENT
// ============================================================================
router.post("/:id/staff", adminAuth, FranchisePropertyController.addStaffMember);

// ============================================================================
// 📌 7️⃣ COMPLIANCE LOG LINKS
// ============================================================================
router.post("/:id/compliance", adminAuth, FranchisePropertyController.appendComplianceLog);

module.exports = router;
