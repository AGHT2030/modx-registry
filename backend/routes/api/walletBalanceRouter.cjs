// © 2025 AIMAL Global Holdings | Wallet Balance API

const express = require("express");
const router = express.Router();
const balanceService = require("../../wallet/balanceService.cjs");

// GET /api/wallet/balance/:address
router.get("/balance/:address", async (req, res) => {
    const { address } = req.params;

    try {
        const result = await balanceService.getHybridBalance(address);
        res.json({ ok: true, result });
    } catch (err) {
        console.error("💥 Balance Router Error:", err);
        res.json({
            ok: false,
            safeMode: true,
            error: "BALANCE_FAILED"
        });
    }
});

module.exports = router;
