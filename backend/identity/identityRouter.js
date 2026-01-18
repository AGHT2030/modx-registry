/**
 * Routes that expose SIT → CoinPurse Identity Layer
 */

const express = require("express");
const router = express.Router();
const IdentityRegistry = require("./sitRegistry");

// ------------------------------------------------------
// GET /identity/:wallet
// Returns SIT identity + metadata
// ------------------------------------------------------
router.get("/identity/:wallet", async (req, res) => {
    try {
        const { wallet } = req.params;

        const sit = IdentityRegistry.SIT;
        if (!sit) {
            return res.status(503).json({
                error: "SIT Identity Layer not yet initialized"
            });
        }

        const tokenId = await sit.getIdentity(wallet);
        if (tokenId === 0n) {
            return res.json({ hasIdentity: false });
        }

        const metadata = await sit.resolveTokenId(tokenId);

        return res.json({
            hasIdentity: true,
            tokenId: tokenId.toString(),
            metadata
        });
    } catch (err) {
        console.error("Identity Fetch Error:", err);
        res.status(500).json({ error: "Identity lookup failed" });
    }
});

module.exports = router;
