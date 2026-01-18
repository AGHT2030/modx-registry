import express from "express";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { verifyMessage } from "ethers";
import { getTrusteeByAddress, storeNonce, consumeNonce } from "./store.js";

export const authRouter = express.Router();

const JWT_SECRET = process.env.TRUSTEE_JWT_SECRET || "CHANGE_ME_LONG_RANDOM";
const STATEMENT =
  process.env.TRUSTEE_SIGNIN_STATEMENT ||
  "AG Holdings Trust — Trustee Portal Access. By signing, you attest you are an authorized trustee/agent.";

export function requireJWT(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

authRouter.post("/nonce", async (req, res) => {
  const address = (req.body?.address || "").toLowerCase();
  if (!address) return res.status(400).json({ error: "Missing address" });

  // Only allow known trustee addresses (or explicitly whitelisted counsel)
  const trustee = await getTrusteeByAddress(address);
  if (!trustee) return res.status(403).json({ error: "Address not authorized" });

  const nonce = randomBytes(16).toString("hex");
  await storeNonce(address, nonce);

  res.json({ nonce, statement: STATEMENT });
});

authRouter.post("/verify", async (req, res) => {
  const address = (req.body?.address || "").toLowerCase();
  const { message, signature } = req.body || {};
  if (!address || !message || !signature) return res.status(400).json({ error: "Missing fields" });

  const trustee = await getTrusteeByAddress(address);
  if (!trustee) return res.status(403).json({ error: "Address not authorized" });

  // Verify signature -> recovered address
  let recovered;
  try {
    recovered = verifyMessage(message, signature).toLowerCase();
  } catch {
    return res.status(400).json({ error: "Signature verification failed" });
  }
  if (recovered !== address) return res.status(401).json({ error: "Address mismatch" });

  // Verify nonce usage
  const nonceOk = await consumeNonce(address, message);
  if (!nonceOk) return res.status(401).json({ error: "Invalid or reused nonce" });

  const token = jwt.sign(
    { address, role: trustee.role, trusteeId: trustee.id },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});
