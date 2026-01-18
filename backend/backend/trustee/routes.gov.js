import express from "express";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import {
  listVotes, getVote, createVote, updateVote,
  listProxies, createProxy, revokeProxy,
  listAttestations, signAttestation,
  listActiveTrustees, quorumRequired, getState, setState,
} from "./store.js";
import { requireRole, ROLES } from "./acl.js";
import { verifyMessage } from "ethers";

export const govRouter = express.Router();

// ----------------------------
// HELPERS
// ----------------------------
function id(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function requireTrustee(req, res, next) {
  if (!requireRole(req.user, [ROLES.TRUSTEE, ROLES.TRUST_ADMIN])) {
    return res.status(403).json({ error: "Trustee role required" });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!requireRole(req.user, [ROLES.TRUST_ADMIN])) {
    return res.status(403).json({ error: "Trust admin role required" });
  }
  return next();
}

// Wallet-signing payload verify helper (trustee signs a canonical message)
function verifySignedAction({ address, message, signature }) {
  const recovered = verifyMessage(message, signature).toLowerCase();
  return recovered === address.toLowerCase();
}

// ----------------------------
// VOTES
// ----------------------------

/**
 * Vote object:
 * {
 *  id, type, title, body, status: "OPEN"|"APPROVED"|"REJECTED"|"EXECUTED",
 *  createdAt, closesAt,
 *  quorumRequired,
 *  ballots: [{address, choice:"APPROVE"|"REJECT", signature, signedAt}]
 * }
 */

govRouter.get("/votes", requireTrustee, (req, res) => {
  res.json({ items: listVotes() });
});

govRouter.post("/votes", requireAdmin, (req, res) => {
  const { type, title, body, closesAt } = req.body || {};
  if (!type || !title) return res.status(400).json({ error: "Missing type/title" });

  const q = quorumRequired(type === "EMERGENCY_REPLACEMENT" ? "EMERGENCY_REPLACEMENT" : "STANDARD");
  const vote = {
    id: id("VOTE"),
    type,
    title,
    body: body || "",
    status: "OPEN",
    createdAt: Date.now(),
    closesAt: closesAt || Date.now() + 1000 * 60 * 60 * 24, // default 24h
    quorumRequired: q,
    ballots: [],
  };
  createVote(vote);
  res.json({ ok: true, vote });
});

govRouter.post("/votes/:id/cast", requireTrustee, (req, res) => {
  const voteId = req.params.id;
  const v = getVote(voteId);
  if (!v) return res.status(404).json({ error: "Vote not found" });
  if (v.status !== "OPEN") return res.status(400).json({ error: "Vote not open" });
  if (Date.now() > v.closesAt) return res.status(400).json({ error: "Vote closed" });

  const { choice, address, message, signature } = req.body || {};
  if (!choice || !address || !message || !signature) return res.status(400).json({ error: "Missing fields" });

  // Must be same as authenticated user
  if (address.toLowerCase() !== req.user.address.toLowerCase()) return res.status(401).json({ error: "Address mismatch" });

  // Verify signature
  if (!verifySignedAction({ address, message, signature })) return res.status(400).json({ error: "Bad signature" });

  // Canonical message requirement (prevents signing something else)
  const mustContain = `VOTE:${voteId}`;
  if (!message.includes(mustContain)) return res.status(400).json({ error: "Invalid vote message" });

  const signedAt = Date.now();
  updateVote(voteId, (vote) => {
    if (vote.ballots.some((b) => b.address.toLowerCase() === address.toLowerCase())) return vote;
    vote.ballots.push({ address, choice, signature, signedAt });

    // Tally
    const approvals = vote.ballots.filter((b) => b.choice === "APPROVE").length;
    const rejects = vote.ballots.filter((b) => b.choice === "REJECT").length;

    // Approve if approvals reach quorumRequired
    if (approvals >= vote.quorumRequired) vote.status = "APPROVED";
    // Reject if rejects reach quorumRequired
    if (rejects >= vote.quorumRequired) vote.status = "REJECTED";

    return vote;
  });

  res.json({ ok: true, vote: getVote(voteId) });
});

// Execute an approved vote (admin only)
govRouter.post("/votes/:id/execute", requireAdmin, (req, res) => {
  const voteId = req.params.id;
  const v = getVote(voteId);
  if (!v) return res.status(404).json({ error: "Vote not found" });
  if (v.status !== "APPROVED") return res.status(400).json({ error: "Vote must be APPROVED" });

  // Emergency Replacement Execution handled below in dedicated endpoint
  // For other votes: mark executed
  updateVote(voteId, (vote) => ({ ...vote, status: "EXECUTED", executedAt: Date.now() }));
  res.json({ ok: true, vote: getVote(voteId) });
});

// ----------------------------
// PROXIES
// ----------------------------

/**
 * Proxy object:
 * { id, grantor, delegate, scope, status:"ACTIVE"|"REVOKED", createdAt, expiresAt }
 */
govRouter.get("/proxies", requireTrustee, (req, res) => {
  res.json({ items: listProxies() });
});

govRouter.post("/proxies", requireTrustee, (req, res) => {
  const { delegate, scope, expiresAt } = req.body || {};
  if (!delegate) return res.status(400).json({ error: "Missing delegate" });

  const proxy = {
    id: id("PROXY"),
    grantor: req.user.address,
    delegate,
    scope: scope || ["VOTE_VIEW", "DOC_VIEW"], // default minimal scope
    status: "ACTIVE",
    createdAt: Date.now(),
    expiresAt: expiresAt || Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  createProxy(proxy);
  res.json({ ok: true, proxy });
});

govRouter.post("/proxies/:id/revoke", requireTrustee, (req, res) => {
  const p = listProxies().find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Proxy not found" });
  if (p.grantor.toLowerCase() !== req.user.address.toLowerCase()) return res.status(403).json({ error: "Only grantor can revoke" });

  revokeProxy(req.params.id);
  res.json({ ok: true });
});

// ----------------------------
// ATTESTATIONS
// ----------------------------
govRouter.get("/attestations", requireTrustee, (req, res) => {
  res.json({ items: listAttestations() });
});

/**
 * POST /attestations/:id/sign
 * body: { address, message, signature }
 * message must include: ATTESTATION:<id>
 */
govRouter.post("/attestations/:id/sign", requireTrustee, (req, res) => {
  const { address, message, signature } = req.body || {};
  if (!address || !message || !signature) return res.status(400).json({ error: "Missing fields" });
  if (address.toLowerCase() !== req.user.address.toLowerCase()) return res.status(401).json({ error: "Address mismatch" });
  if (!verifySignedAction({ address, message, signature })) return res.status(400).json({ error: "Bad signature" });
  if (!message.includes(`ATTESTATION:${req.params.id}`)) return res.status(400).json({ error: "Invalid attestation message" });

  signAttestation(req.params.id, { address, signature, signedAt: Date.now() });
  res.json({ ok: true, items: listAttestations() });
});

// ----------------------------
// AUDIT EXPORT (JSON + PDF)
// ----------------------------
govRouter.get("/audit", requireTrustee, (req, res) => {
  const format = (req.query.format || "json").toLowerCase();
  const state = getState();

  const audit = {
    generatedAt: new Date().toISOString(),
    generatedBy: req.user.address,
    trusteesActive: listActiveTrustees().map((t) => ({ id: t.id, address: t.address })),
    quorum: {
      STANDARD: quorumRequired("STANDARD"),
      EMERGENCY_REPLACEMENT: quorumRequired("EMERGENCY_REPLACEMENT"),
    },
    votes: state.votes,
    proxies: state.proxies,
    attestations: state.attestations,
    docsIndex: state.docs.map(({ id, title, status }) => ({ id, title, status })),
  };

  if (format === "json") {
    return res.json(audit);
  }

  if (format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="trustee_audit_${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);

    doc.fontSize(16).text("AG Holdings Trust — Trustee Audit Export", { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${audit.generatedAt}`);
    doc.text(`Generated By: ${audit.generatedBy}`);
    doc.moveDown();

    doc.fontSize(12).text("Active Trustees");
    audit.trusteesActive.forEach((t) => doc.fontSize(10).text(`• ${t.id}: ${t.address}`));
    doc.moveDown();

    doc.fontSize(12).text("Quorum Summary");
    doc.fontSize(10).text(`• STANDARD: ${audit.quorum.STANDARD}`);
    doc.fontSize(10).text(`• EMERGENCY_REPLACEMENT: ${audit.quorum.EMERGENCY_REPLACEMENT}`);
    doc.moveDown();

    doc.fontSize(12).text("Votes");
    audit.votes.slice(0, 50).forEach((v) => {
      doc.fontSize(10).text(`• ${v.id} [${v.type}] ${v.status} — ${v.title}`);
    });
    doc.moveDown();

    doc.fontSize(12).text("Proxies");
    audit.proxies.slice(0, 50).forEach((p) => {
      doc.fontSize(10).text(`• ${p.id} ${p.status}: ${p.grantor} → ${p.delegate} (exp ${new Date(p.expiresAt).toISOString()})`);
    });
    doc.moveDown();

    doc.fontSize(12).text("Attestations");
    audit.attestations.forEach((a) => {
      doc.fontSize(10).text(`• ${a.id} ${a.status}: ${a.title} (signed ${a.signedBy.length})`);
    });

    doc.end();
    return;
  }

  return res.status(400).json({ error: "format must be json or pdf" });
});

// ----------------------------
// EMERGENCY TRUSTEE REPLACEMENT FLOW
// ----------------------------

/**
 * 2-step safety:
 * 1) Create vote type EMERGENCY_REPLACEMENT (SUPERMAJORITY required)
 * 2) Execute replacement ONLY if vote is APPROVED
 *
 * request body: { voteId, removeAddress, addAddress, addId }
 */
govRouter.post("/trustees/emergency-replace", requireAdmin, (req, res) => {
  const { voteId, removeAddress, addAddress, addId } = req.body || {};
  if (!voteId || !removeAddress || !addAddress || !addId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const v = getVote(voteId);
  if (!v) return res.status(404).json({ error: "Vote not found" });
  if (v.type !== "EMERGENCY_REPLACEMENT") return res.status(400).json({ error: "Wrong vote type" });
  if (v.status !== "APPROVED") return res.status(400).json({ error: "Vote must be APPROVED" });

  // Execute replacement in trustee registry
  setState((s) => {
    s.trustees = s.trustees.map((t) => {
      if (t.address.toLowerCase() === removeAddress.toLowerCase()) {
        return { ...t, status: "RETIRED", retiredAt: Date.now() };
      }
      return t;
    });

    // Add new trustee
    s.trustees.unshift({
      id: addId,
      address: addAddress,
      role: "TRUSTEE",
      status: "ACTIVE",
      createdAt: Date.now(),
      reason: "EMERGENCY_REPLACEMENT_APPROVED",
    });

    return s;
  });

  // Mark vote executed
  updateVote(voteId, (vote) => ({ ...vote, status: "EXECUTED", executedAt: Date.now(), execution: { removeAddress, addAddress, addId } }));

  res.json({ ok: true });
});
