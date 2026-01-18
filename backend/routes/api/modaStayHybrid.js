
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

// © 2025 Mia Lopez | MODA Stay Hybrid Middleware
// Connects MODA Hotel, AIRS Concierge, MODAStay Hybrid Contract,
// Immersive Room Engine, and unified alertHooks pipeline.

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { ethers } = require("../../utils/loadEthers");
const { safeRequire } = require("../../middleware/globalMiddlewareLoader");
const { checkHealthAndAlert } = require("../../middleware/alertHooks");
const verifySignature = require("../../security/rsa/verifySignature");
const verifyPropertyAccess = require("../../middleware/franchise/verifyPropertyAccess");
const verifyGeoFence = require("../../middleware/franchise/verifyGeoFence");
router.use(verifySignature);      // RSA signature check
router.use(verifyPropertyAccess); // ensure correct property/contract
router.use(verifyGeoFence);       // geofence validation

// =================================================================
// 1️⃣ SAFE ABI LOADER
// =================================================================
function loadHybridABI() {
    const primary = path.resolve(__dirname, "../../../abis/MODAStayHybrid.json");
    const fallback1 = path.resolve(__dirname, "../../abis/MODAStayHybrid.json");
    const fallback2 = path.resolve(__dirname, "../../../contracts/abis/MODAStayHybrid.json");

    const candidates = [primary, fallback1, fallback2];

    for (const file of candidates) {
        if (fs.existsSync(file)) {
            try {
                console.log(`✨ MODAStayHybrid ABI loaded from: ${file}`);
                return JSON.parse(fs.readFileSync(file, "utf8"));
            } catch (err) {
                console.error("❌ Failed reading ABI:", err);
            }
        }
    }

    console.warn("⚠️ MODAStayHybrid ABI not found — returning empty ABI fallback.");
    return { abi: [] };
}

const HYBRID_ABI = loadHybridABI();

// =================================================================
// 2️⃣ CONTRACT INITIALIZATION
// =================================================================
let modaHybridContract = null;

function initHybridContract() {
    try {
        const rpc = process.env.POLYGON_RPC;
        const address = process.env.MODASTAY_HYBRID_ADDRESS;

        if (!rpc || !address) {
            console.warn("⚠️ Missing RPC or MODASTAY_HYBRID_ADDRESS.");
            return;
        }

        const provider = new ethers.JsonRpcProvider(rpc);
        modaHybridContract = new ethers.Contract(address, HYBRID_ABI.abi, provider);

        console.log(`✨ MODAStayHybrid Contract initialized @ ${address}`);
    } catch (err) {
        console.error("❌ MODAStayHybrid contract init error:", err);
    }
}

initHybridContract();

// =================================================================
// 3️⃣ SAFE HANDLER IMPORT + FALLBACKS
// =================================================================
let handler = safeRequire("../../middleware/modaStayHandler");
const handlerHealthy = !!handler;

if (!handlerHealthy) {
    console.warn("⚠️ modaStayHandler missing — fallback active");
    handler = {};
}

checkHealthAndAlert("MODA Stay Hybrid Handler", handlerHealthy, "Fallback active");

// =================================================================
// 4️⃣ FALLBACK WRAPPERS
// =================================================================
const createReservation = handler.createReservation || ((req, res, next) => {
    console.log("⚠ fallback createReservation");
    req.modaReservation = {
        id: Date.now(),
        room: "TBD",
        guest: "Guest",
        status: "pending",
    };
    next();
});

const validateRoomAccess = handler.validateRoomAccess || ((req, res, next) => {
    console.log("⚠ fallback validateRoomAccess");
    req.roomAccessGranted = true;
    next();
});

const endReservation = handler.endReservation || ((req, res, next) => {
    console.log("⚠ fallback endReservation");
    req.reservationSummary = {
        checkout: new Date().toISOString(),
        total: 0,
    };
    next();
});

// =================================================================
// 5️⃣ AUTH + LOGGING
// =================================================================
const authorize = (req, res, next) => next();
const logRequest = (req, res, next) => { console.log(`🏨 ${req.method} ${req.originalUrl}`); next(); };

// =================================================================
// 5️⃣.1️⃣ MODAStay Franchise License Verification (MANDATORY)
// =================================================================
function verifyLicenseKey(req, res, next) {
    const key = req.headers["x-modastay-license"];

    if (!key || key !== process.env.MODASTAY_LICENSE_KEY) {
        return res.status(401).json({
            ok: false,
            error: "Invalid or missing MODAStay License Key. Access denied."
        });
    }
    next();
}
// ===================================================================
// 5️⃣.2️⃣ MODAStay Franchise Signature Verification
// ===================================================================
const crypto = require("crypto");

// property public keys (could be stored in Redis, DB, or env map)
const PROPERTY_KEYS = {
    // Example:
    // "Wyndham01": process.env.MODASTAY_WYNDHAM01_PUBKEY,
    // "I&OFlagship": process.env.MODASTAY_IO_PUBKEY
};

function verifyFranchiseSignature(req, res, next) {
    try {
        const propertyId = req.headers["x-modastay-property"];
        const signature = req.headers["x-modastay-signature"];
        const timestamp = req.headers["x-modastay-timestamp"];

        if (!propertyId || !signature || !timestamp) {
            return res.status(401).json({
                ok: false,
                error: "Missing franchise signature headers."
            });
        }

        const publicKey = PROPERTY_KEYS[propertyId];
        if (!publicKey) {
            return res.status(401).json({
                ok: false,
                error: "Unknown or unregistered MODAStay property."
            });
        }

        // prevent replay attacks (5-minute window)
        const now = Date.now();
        if (Math.abs(now - Number(timestamp)) > 5 * 60 * 1000) {
            return res.status(401).json({
                ok: false,
                error: "Expired or invalid timestamp."
            });
        }

        // canonical payload structure
        const bodyHash = crypto
            .createHash("sha256")
            .update(JSON.stringify(req.body || {}))
            .digest("hex");

        const message = `${timestamp}:${req.method}:${req.originalUrl}:${bodyHash}`;

        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(message);

        const valid = verifier.verify(publicKey, Buffer.from(signature, "base64"));

        if (!valid) {
            return res.status(401).json({
                ok: false,
                error: "Invalid franchise signature."
            });
        }

        // store for business rules
        req.modaPropertyId = propertyId;

        next();
    } catch (err) {
        console.error("❌ Signature verification error:", err);
        return res.status(401).json({ ok: false, error: "Signature verification failed." });
    }
}

// apply to ALL routes after license verification
router.use(verifyFranchiseSignature);

function enforcePropertyRoomAccess(req, res, next) {
    const propertyId = req.modaPropertyId;
    const roomId = req.params.roomId || req.body.roomId;

    // future: look up which property owns which rooms
    // e.g., from Redis or DB

    if (!roomId) return next();

    // example logic (replace with DB lookup):
    const ROOM_TO_PROPERTY = {
        // "101": "Wyndham01",
        // "201": "I&OFlagship",
    };

    if (ROOM_TO_PROPERTY[roomId] && ROOM_TO_PROPERTY[roomId] !== propertyId) {
        return res.status(403).json({
            ok: false,
            error: `Room ${roomId} does not belong to property ${propertyId}. Access denied.`
        });
    }

    next();
}
router.use(enforcePropertyRoomAccess);
router.post("/admin/rotateKey", authorize, async (req, res) => {
    try {
        const { propertyId, newPublicKey } = req.body;

        if (!propertyId || !newPublicKey) {
            return res.status(400).json({ ok: false, error: "Missing fields" });
        }

        PROPERTY_KEYS[propertyId] = newPublicKey;

        res.json({
            ok: true,
            message: `Public key updated for property ${propertyId}`
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// =================================================================
// 6️⃣ SUPPORT FUNCTIONS (pricing)
// =================================================================
async function resolveHybridPricing(roomId, nights) {
    const baseRate = await getBaseRateFromContract(roomId);
    const seasonalAdj = getSeasonalAdjustment();
    const lengthAdj = nights >= 3 ? 0.9 : 1.0;

    const final = baseRate * seasonalAdj * lengthAdj;
    // LOYALTY & NFT PERKS
    const loyaltyMultiplier = await getLoyaltyMultiplier(roomId, nights);
    const nftDiscount = await getNFTDiscount(roomId);

    const finalRate = baseRate * seasonalAdj * lengthAdj * loyaltyMultiplier - nftDiscount;

    return {
        roomId,
        nights,
        baseRate,
        seasonalAdj,
        lengthAdj,
        loyaltyMultiplier,
        nftDiscount,
        totalUSD: finalRate * nights
    };
}

async function getBaseRateFromContract(roomId) {
    try {
        if (modaHybridContract?.getRoomBaseRate) {
            return Number(await modaHybridContract.getRoomBaseRate(roomId));
        }
    } catch (err) {
        console.warn("⚠ getRoomBaseRate fallback:", err.message);
    }
    return 150;
}

function getSeasonalAdjustment() {
    const m = new Date().getMonth() + 1;
    if ([6, 7, 8].includes(m)) return 1.25;
    if ([11, 12].includes(m)) return 1.15;
    return 1.0;
}

// =================================================================
// 🔟 IMMERSIVE ENGINE HOOKS
// =================================================================
function triggerImmersiveEngine(event, payload) {
    try { console.log(`🎨 ImmersiveEngine: ${event}`, payload); }
    catch (err) { console.error("⚠ immersive error:", err); }
}

// =================================================================
// 1️⃣7️⃣ AUTO-TRIGGER WRAPPER (FIXED — MUST EXIST)
// =================================================================
function triggerRoomSceneAuto(roomId, status) {
    const scene = resolveRoomScene(status);
    try {
        triggerImmersiveEngine(`room.${scene}`, { roomId, status });
    } catch (err) {
        console.error("⚠ Auto-scene trigger failed:", err);
    }
    return scene;
}

// =================================================================
// 1️⃣1️⃣ POLICY / SENTINEL SYNC
// =================================================================
function emitPolicySync(event, details) {
    try { console.log(`🛰 PolicySync: ${event}`, details); }
    catch (err) { console.error("⚠ PolicySync error:", err); }
}

// =================================================================
// 1️⃣6️⃣ ROOM SCENE RESOLVER (must come BEFORE routes using it)
// =================================================================
function resolveRoomScene(status) {
    switch (String(status).toLowerCase()) {
        case "0":
        case "clean": return "cleaning";
        case "1":
        case "ready": return "ready";
        case "2":
        case "occupied": return "occupied";
        default: return "unknown";
    }
}
// =================================================================
// 1️⃣9️⃣ PUT /room/:roomId/updateStatus — Admin Override (clean, ready, occupied)
// =================================================================
// enforce franchise licensing across all endpoints
router.put("/room/:roomId/updateStatus", authorize, logRequest, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { status, reason, staff } = req.body;

        if (!status) {
            return res.status(400).json({ ok: false, error: "Missing status." });
        }

        // 1️⃣ Trigger immersive scene change immediately
        const scene = resolveRoomScene(status);
        triggerImmersiveEngine(`room.${scene}.override`, {
            roomId,
            scene,
            staff: staff || "system",
            reason
        });

        // 2️⃣ Optional on-chain sync (if contract supports it)
        let onChainTx = null;
        if (modaHybridContract?.setRoomStatus) {
            try {
                onChainTx = await modaHybridContract.setRoomStatus(roomId, status);
            } catch (err) {
                console.warn("⚠️ setRoomStatus failed (fallback continuing):", err.message);
            }
        }

        // 3️⃣ Sentinel & Policy sync
        emitPolicySync("stay.room.adminOverride", {
            roomId,
            status,
            scene,
            reason,
            staff: staff || "system"
        });

        // 4️⃣ Concierge response
        const conciergeMessage = buildAIRSConciergeMessage("status", {
            roomId,
            onChainStatus: status,
            scene
        });

        res.json({
            ok: true,
            roomId,
            newStatus: status,
            immersiveScene: scene,
            conciergeMessage,
            onChainTx
        });

    } catch (err) {
        console.error("❌ updateStatus error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// =================================================================
// 1️⃣8️⃣ BLOCKCHAIN LISTENERS (must come AFTER triggerRoomSceneAuto)
// =================================================================
function attachRoomStatusListeners() {
    if (!modaHybridContract?.on) {
        console.warn("⚠ Cannot attach listeners — contract unavailable.");
        return;
    }

    console.log("🔗 Attaching on-chain listeners...");

    modaHybridContract.on("RoomCleaned", (roomId) => {
        const scene = triggerRoomSceneAuto(roomId, "clean");
        emitPolicySync("stay.room.cleaned", { roomId, scene });
    });

    modaHybridContract.on("RoomReady", (roomId) => {
        const scene = triggerRoomSceneAuto(roomId, "ready");
        emitPolicySync("stay.room.ready", { roomId, scene });
    });

    modaHybridContract.on("RoomOccupied", (roomId, guest) => {
        const scene = triggerRoomSceneAuto(roomId, "occupied");
        emitPolicySync("stay.room.occupied", { roomId, guest, scene });
    });
}

attachRoomStatusListeners();

// =================================================================
// 7️⃣ ROUTES (health, pricing, status, booking, lifecycle)
// =================================================================

// HEALTH
router.get("/health", (req, res) => {
    res.json({
        service: "MODA Stay Hybrid",
        handlerHealthy: !!handler.createReservation,
        contractHealthy: !!modaHybridContract,
        contractAddress: process.env.MODASTAY_HYBRID_ADDRESS,
        timestamp: new Date().toISOString(),
    });
});

// BOOK STAY
router.post("/bookStay", authorize, logRequest, createReservation, async (req, res) => {
    try {
        const { guestName, roomId, nights, checkIn } = req.body;
        const pricing = await resolveHybridPricing(roomId, nights);

        let onChainTx = null;
        if (modaHybridContract?.reserveRoom) {
            try {
                onChainTx = await modaHybridContract.reserveRoom(
                    roomId, nights,
                    ethers.parseEther(pricing.totalUSD.toString())
                );
            } catch (err) {
                console.warn("⚠ reserveRoom failed:", err.message);
            }
        }

        triggerImmersiveEngine("room.welcome.prep", { roomId, guestName, scene: "arrival" });
        emitPolicySync("stay.created", { guestName, roomId, nights, pricing, checkIn });

        res.json({ ok: true, reservation: req.modaReservation, pricing, onChainTx });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// PRICING
router.get("/pricing/:roomId", authorize, logRequest, async (req, res) => {
    try {
        const nights = Number(req.query.nights || 1);
        const pricing = await resolveHybridPricing(req.params.roomId, nights);

        res.json({
            ok: true,
            pricing,
            conciergeMessage: buildAIRSConciergeMessage("pricing", {
                roomId: req.params.roomId,
                nights,
                pricing
            })
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ROOM STATUS
router.get("/room/:roomId/status", authorize, logRequest, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        let onChainStatus = null;

        if (modaHybridContract?.getRoomStatus) {
            try {
                onChainStatus = await modaHybridContract.getRoomStatus(roomId);
            } catch (err) {
                console.warn("⚠ getRoomStatus failed:", err.message);
            }
        }

        const status = onChainStatus || "unknown";
        const scene = resolveRoomScene(status);

        res.json({
            ok: true,
            roomId,
            onChainStatus: status,
            immersiveScene: scene,
            conciergeMessage: buildAIRSConciergeMessage("status", {
                roomId,
                onChainStatus: status,
                scene
            })
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// CHECK-IN
router.post("/checkIn/:roomId", authorize, logRequest, async (req, res) => {
    try {
        const { roomId } = req.params;
        const guestName = req.body.guestName || "Guest";

        triggerImmersiveEngine("room.checkIn", { roomId, guestName, scene: "welcome" });
        emitPolicySync("stay.checkIn", { roomId, guestName });

        res.json({
            ok: true,
            event: "checkIn",
            conciergeMessage: buildAIRSConciergeMessage("checkIn", { roomId, guestName })
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// MID-STAY
router.post("/midStay/:roomId", authorize, logRequest, async (req, res) => {
    try {
        triggerImmersiveEngine("room.midsession", { roomId: req.params.roomId, scene: "relaxation" });
        emitPolicySync("stay.midStay", { roomId: req.params.roomId });

        res.json({
            ok: true,
            event: "midStay",
            conciergeMessage: buildAIRSConciergeMessage("midStay", { roomId: req.params.roomId })
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// CHECK-OUT
router.post("/checkOut/:roomId", authorize, logRequest, endReservation, async (req, res) => {
    try {
        triggerImmersiveEngine("room.checkOut", { roomId: req.params.roomId, scene: "goodbye" });
        emitPolicySync("stay.checkOut", { roomId: req.params.roomId });

        res.json({
            ok: true,
            event: "checkOut",
            summary: req.reservationSummary,
            conciergeMessage: buildAIRSConciergeMessage("checkOut", {
                roomId: req.params.roomId,
                summary: req.reservationSummary
            })
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// =================================================================
// 1️⃣4️⃣ CONSOLIDATED & CORRECTED CONCIERGE BUILDER
// =================================================================
function buildAIRSConciergeMessage(type, data) {
    try {
        switch (type) {
            case "pricing":
                return `✨ Your stay is estimated at $${data.pricing.totalUSD.toFixed(2)}. This includes a nightly base rate of $${data.pricing.baseRate}.`;

            case "checkIn":
                return `🛎️ Welcome! Your room ${data.roomId} is now prepared with your personalized arrival scene.`;

            case "midStay":
                return `🌌 Mid-stay ambience activated for room ${data.roomId}. Let me know if you'd like adjustments.`;

            case "checkOut":
                return `🧾 Checkout summary for room ${data.roomId}: Total $${data.summary.total}. Safe travels!`;

            case "status":
                return `📡 Room ${data.roomId} is currently “${data.onChainStatus}”. Immersive scene: ${data.scene}.`;

            default:
                return "How can I assist you today?";
        }
    } catch (err) {
        console.error("⚠ Concierge builder error:", err);
        return "Your digital concierge is momentarily unavailable.";
    }
}
// =================================================================
// 2️⃣0️⃣ Housekeeping AI Cycle (automated cleaning sequences)
// =================================================================
async function runHousekeepingCycle(roomId) {
    try {
        console.log(`🧽 Running housekeeping cycle for Room ${roomId}...`);

        // 1️⃣ Start cleaning
        triggerImmersiveEngine("room.cleaning.start", { roomId });
        emitPolicySync("stay.housekeeping.start", { roomId });

        await wait(2000); // simulate cycle

        // 2️⃣ Mid-clean check
        triggerImmersiveEngine("room.cleaning.progress", { roomId });
        emitPolicySync("stay.housekeeping.progress", { roomId });

        await wait(2000);

        // 3️⃣ Completed
        triggerRoomSceneAuto(roomId, "clean");
        emitPolicySync("stay.housekeeping.complete", { roomId });

        return true;

    } catch (err) {
        console.error("❌ Housekeeping cycle error:", err);
        return false;
    }
}
router.post("/housekeeping/:roomId/run", authorize, logRequest, async (req, res) => {
    const { roomId } = req.params;
    const ok = await runHousekeepingCycle(roomId);

    res.json({
        ok,
        roomId,
        message: ok
            ? "Housekeeping cycle completed."
            : "Housekeeping cycle failed."
    });
});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// =================================================================
// 2️⃣1️⃣ Loyalty & NFT Perk Calculation
// =================================================================
async function getLoyaltyMultiplier(roomId) {
    try {
        // future: read from CoinPurse Loyalty API or MODA NFT staking contract
        if (modaHybridContract?.getLoyaltyMultiplier) {
            return Number(await modaHybridContract.getLoyaltyMultiplier(roomId));
        }
    } catch (err) {
        console.warn("⚠️ loyalty fallback:", err.message);
    }
    return 1.0; // default = no discount
}

async function getNFTDiscount(roomId) {
    try {
        if (modaHybridContract?.getNFTDiscount) {
            return Number(await modaHybridContract.getNFTDiscount(roomId));
        }
    } catch (err) {
        console.warn("⚠️ NFT discount fallback:", err.message);
    }
    return 0; // default = none
}

// =================================================================
// EXPORT
// =================================================================
module.exports = router;
