/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * Trustee Auth Guard — INTERNAL ONLY
 *
 * Simple JWT gate for admin endpoints.
 * Required env:
 *  - TRUSTEE_JWT_SECRET
 *
 * Token claims expected:
 *  - sub (who)
 *  - role: "trustee" | "compliance"
 */

const jwt = require("jsonwebtoken");

function trusteeAuth(options = {}) {
  const {
    rolesAllowed = ["trustee", "compliance"],
    headerName = "authorization"
  } = options;

  const secret = process.env.TRUSTEE_JWT_SECRET;
  if (!secret) {
    throw new Error("TRUSTEE_JWT_SECRET missing — cannot verify trustee tokens");
  }

  return (req, res, next) => {
    try {
      const raw = req.headers[headerName];
      const token =
        raw && raw.startsWith("Bearer ") ? raw.slice("Bearer ".length) : null;

      if (!token) {
        return res.status(401).json({ ok: false, error: "missing_trustee_token" });
      }

      const claims = jwt.verify(token, secret);

      const role = claims.role || claims.r || null;
      if (!role || !rolesAllowed.includes(role)) {
        return res.status(403).json({
          ok: false,
          error: "insufficient_trustee_role",
          role
        });
      }

      req.trustee = claims;
      return next();
    } catch (err) {
      return res.status(401).json({ ok: false, error: "invalid_trustee_token" });
    }
  };
}

module.exports = { trusteeAuth };
