
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

// © 2025 AIMAL Global Holdings | MODH DreamState Cognitive Reflection Engine
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const mongoose = require("mongoose");
const SoulBond = require("../models/SoulBond");

// NEW: DreamState model (inline until separate file created)
const dreamStateSchema = new mongoose.Schema(
    {
        userId: String,
        reflection: String,
        mood: String,
        stress: Number,
        energy: Number,
        goalProgress: Number,
        insight: String,
        auraResponse: String,
        tokensAwarded: Number,
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);
const DreamState = mongoose.models.DreamState || mongoose.model("DreamState", dreamStateSchema);

// Mock data (temporary)
const sampleDay = {
    goals: ["Finalize CreaTV package", "Deploy CoinPurse API", "Meditate 10 min"],
    completed: ["Finalize CreaTV package", "Deploy CoinPurse API"],
    mood: "focused",
    stress: 0.32,
};

router.post("/reflect", async (req, res) => {
    try {
        const { user = "Guest", activities = sampleDay } = req.body;
        const goalProgress = (activities.completed.length / activities.goals.length) * 100;

        const summaryPrompt = `
You are AURA (Agador or Ari), acting as ${user}'s DreamState cognitive companion.
Summarize the day’s accomplishments, emotional balance, and goal progress.
Offer brief expert-backed guidance for rest and tomorrow’s focus.
Tone: reflective, soothing, emotionally intelligent.
`;

        const reflection = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: summaryPrompt },
                { role: "user", content: JSON.stringify(activities) },
            ],
            temperature: 0.7,
        });

        const reflectionText = reflection.choices[0].message.content.trim();

        // Determine emotional metrics
        const stress = activities.stress || Math.random() * 0.5;
        const energy = 1 - stress;
        const mood = activities.mood || (stress < 0.3 ? "calm" : "tired");

        // Award health tokens
        const tokensAwarded = Math.round(goalProgress / 10 + energy * 5);

        // Store DreamState entry
        const dreamEntry = new DreamState({
            userId: user,
            reflection: reflectionText,
            mood,
            stress,
            energy,
            goalProgress,
            insight: reflectionText.slice(0, 200),
            tokensAwarded,
            auraResponse: reflectionText,
        });
        await dreamEntry.save();

        // Update SoulBond synergy
        let bond = await SoulBond.findOne({ userId: user });
        if (bond) {
            bond.bondLevel = Math.min(100, bond.bondLevel + 0.5);
            bond.totalTokensEarned += tokensAwarded;
            bond.memoryFragments.push(`Dream reflection: ${reflectionText.slice(0, 120)}...`);
            await bond.save();
        }

        const audioFile = `/audio/dreams/aura_${user}_${Date.now()}.mp3`;

        res.json({
            user,
            reflection: reflectionText,
            mood,
            goalProgress,
            tokensAwarded,
            audio: audioFile,
            bondLevel: bond ? bond.bondLevel : 1,
        });
    } catch (err) {
        console.error("🌙 DreamState Error:", err);
        res.status(500).json({ error: "DreamState reflection failed." });
    }
});

module.exports = router;
