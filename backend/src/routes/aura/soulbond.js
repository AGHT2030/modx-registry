
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

// © 2025 AIMAL Global Holdings | AURA SoulBond API
// Handles creation, reflection updates, and bond-level progression

const express = require("express");
const router = express.Router();
const SoulBond = require("../../models/SoulBond");

// GET soul bond info
router.get("/:userId", async (req, res) => {
    try {
        const bond = await SoulBond.findOne({ userId: req.params.userId });
        if (!bond) return res.status(404).json({ error: "No bond found" });
        res.json(bond);
    } catch (err) {
        console.error("⚠️ SoulBond fetch error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST create or update bond
router.post("/update", async (req, res) => {
    try {
        const { userId, mood, focus, insight } = req.body;
        let bond = await SoulBond.findOne({ userId });

        if (!bond) {
            bond = new SoulBond({ userId });
        }

        // evolve bond level slowly with engagement
        bond.bondLevel = Math.min(100, bond.bondLevel + 0.25);
        bond.emotionalProfile.mood = mood || bond.emotionalProfile.mood;
        bond.emotionalProfile.focus = focus || bond.emotionalProfile.focus;
        bond.memoryFragments.push(insight || "Reflected insight");

        // token reward logic
        const tokenEarned = 10 * (focus || 1);
        bond.totalTokensEarned += tokenEarned;
        bond.lastInteraction = new Date();

        await bond.save();

        res.json({
            success: true,
            message: "Soul bond strengthened",
            bondLevel: bond.bondLevel,
            tokensEarned: tokenEarned,
        });
    } catch (err) {
        console.error("⚠️ SoulBond update error:", err);
        res.status(500).json({ error: "Could not update bond" });
    }
});

module.exports = router;
