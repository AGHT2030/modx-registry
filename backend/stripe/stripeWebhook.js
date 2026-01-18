/**
 * MODE Stripe Webhook
 * Converts payments → MODUSD mint → ETF allocation
 */

const express = require("express");
const router = express.Router();

router.post("/webhook", async (req, res) => {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
        // 1. Identify SKU
        // 2. Mint MODUSD
        // 3. Call settlement adapter
    }

    res.json({ received: true });
});

module.exports = router;
