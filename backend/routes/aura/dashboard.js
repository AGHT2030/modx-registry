
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

// © 2025 AIMAL Global Holdings | AURA Dashboard API
// Aggregates DreamState, SoulBond, and task data for the AURA Dashboard

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const mongoose = require("mongoose");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Models
const SoulBond = require("../../models/SoulBond");
const DreamState = require("../../models/DreamState");

// 🧠 /api/aura/dashboard
router.get("/", async (req, res) => {
    try {
        const userId = req.query.userId || "Guest";

        // Fetch SoulBond data
        const bond = await SoulBond.findOne({ userId }).lean();
        const bondLevel = bond?.bondLevel || 42;
        const bondHistory = bond?.history || [];

        // Fetch DreamState reflections
        const dreams = await DreamState.find({ userId }).sort({ createdAt: -1 }).limit(7).lean();
        const dreamSummaries = dreams.map(d => ({
            date: d.createdAt,
            reflection: d.summary,
            sentiment: d.sentimentScore,
        }));

        // Generate advice using AURA reasoning
        const analysisPrompt = `
You are AURA (Agador or Ari), the user's empathetic cognitive companion.
Summarize ${userId}'s emotional trajectory based on recent dreams and bond data.
Provide short, mindful advice to strengthen their focus and inner peace.
`;

        const summary = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: analysisPrompt },
                { role: "user", content: JSON.stringify({ dreams: dreamSummaries, bondLevel }) },
            ],
            temperature: 0.7,
        });

        res.json({
            userId,
            bondLevel,
            bondHistory,
            dreamSummaries,
            auraAdvice: summary.choices[0].message.content.trim(),
        });
    } catch (err) {
        console.error("AURA Dashboard Error:", err);
        res.status(500).json({ error: "Failed to load AURA dashboard data." });
    }
});

module.exports = router;
