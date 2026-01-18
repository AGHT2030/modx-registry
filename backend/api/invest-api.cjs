/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * INVEST API Host — Authoritative Intake Surface
 */

// --------------------------------------------------
// ENV — MUST LOAD FIRST (ABSOLUTELY NO IMPORTS ABOVE)
// --------------------------------------------------
const dotenv = require("dotenv");
dotenv.config({ path: process.env.ENV_PATH || ".env.override" });

// --------------------------------------------------
// APP
// --------------------------------------------------
const express = require("express");
console.log("🔥 RUNNING INVEST API FROM:", __filename);

const app = express();
app.use(express.json({ limit: "2mb" }));

// --------------------------------------------------
// MIDDLEWARE (SAFE AFTER ENV LOAD)
// --------------------------------------------------
const { poaVerify } = require("../middleware/poaVerify.cjs");
const { trusteeAuth } = require("../middleware/trusteeAuth.cjs");

// Trustee/admin guard (single source of truth)
const requireTrustee = trusteeAuth({
  rolesAllowed: ["trustee", "compliance"],
});

// --------------------------------------------------
// ROUTES (IMPORT ONCE — NO DUPLICATES)
// --------------------------------------------------
const {
  router: poaRouter,
  issuePoaToken,
} = require("../routes/poa/verify-route.cjs");

const investmentIntakeRoutes =
  require("../routes/investment/intake-route.cjs");

const investorIntakeRoutes =
  require("../routes/investment/investor-intake-route.cjs");

// --------------------------------------------------
// HEALTH
// --------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    service: "INVEST_API",
    status: "online",
    time: new Date().toISOString(),
  });
});

// --------------------------------------------------
// POA ADMIN (TRUSTEE / COMPLIANCE ONLY)
// --------------------------------------------------

// Explicit POA issuance (authoritative)
app.post(
  "/api/poa/issue",
  requireTrustee,
  issuePoaToken
);

// Mount POA router (verify / revoke / status / audit)
app.use(
  "/api/poa",
  requireTrustee,
  poaRouter
);

console.log("✅ POA issue route registered at /api/poa/issue");
console.log("✅ POA router mounted at /api/poa");

// --------------------------------------------------
// POA / BROKER / PARTNER INTAKE (SIGNED TOKEN REQUIRED)
// --------------------------------------------------
app.use(
  "/api/investment",
  poaVerify({
    scopeRequired: "intake:init",
    service: "poa-verifier",
  }),
  investmentIntakeRoutes
);

// --------------------------------------------------
// INVESTOR SELF-DIRECTED INTAKE (NO POA REQUIRED)
// --------------------------------------------------
app.use(
  "/api/investment/investor",
  investorIntakeRoutes
);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
const PORT = Number(process.env.INVEST_API_PORT || 8091);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 INVEST API online on ${PORT}`);
});
