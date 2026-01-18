/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * POA Signed Token Utilities (HMAC)
 */

const crypto = require("crypto");

function b64urlEncode(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlDecode(str) {
  const pad = str.length % 4 ? "=".repeat(4 - (str.length % 4)) : "";
  const s = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(s, "base64");
}

function signHmac(payloadObj, secret) {
  const header = { alg: "HS256", typ: "MODX-POA" };
  const headerB64 = b64urlEncode(JSON.stringify(header));
  const payloadB64 = b64urlEncode(JSON.stringify(payloadObj));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  const sigB64 = b64urlEncode(sig);
  return `${data}.${sigB64}`;
}

function verifyHmac(token, secret) {
  if (!token || typeof token !== "string") return { ok: false, error: "missing_token" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "bad_format" };

  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expected = b64urlEncode(crypto.createHmac("sha256", secret).update(data).digest());
  // constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(s);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, error: "bad_sig" };

  let payload;
  try {
    payload = JSON.parse(b64urlDecode(p).toString("utf8"));
  } catch {
    return { ok: false, error: "bad_payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return { ok: false, error: "expired", payload };
  return { ok: true, payload };
}

function newNonce() {
  return crypto.randomUUID();
}

module.exports = {
  signHmac,
  verifyHmac,
  newNonce,
};
