import { readJSON, writeJSON } from "./store.persist.js";
import { computeQuorum } from "./acl.js";

/**
 * IMPORTANT: Trustees generate their own keys.
 * We only store public addresses and roles here.
 */
const DEFAULT_STATE = {
  trustees: [
    // Fill in real addresses:
    // { id: "TRUSTEE_01", address: "0x...", role: "TRUSTEE", status: "ACTIVE" },
    // { id: "TRUSTEE_02", address: "0x...", role: "TRUSTEE", status: "ACTIVE" },
    // { id: "TRUSTEE_03", address: "0x...", role: "TRUSTEE", status: "ACTIVE" },
// backend/trustee/store.js

const DEFAULT_STATE = {
  trustees: [
    // trustees here
  ],

  quorumPolicy: {
    STANDARD: { type: "MAJORITY" },
    EMERGENCY_REPLACEMENT: { type: "SUPERMAJORITY" },
    // FIXED example:
    // STANDARD: { type: "FIXED_N", n: 2 }
  },

  votes: [],
  proxies: [],
  attestations: [],
  docs: []
};

  ],
  // Quorum settings for different action types
  quorumPolicy: {
    STANDARD: { type: "MAJORITY" },
    PROXY: { type: "MAJORITY" },
    ATTESTATION: { type: "MAJORITY" },
    EMERGENCY_REPLACEMENT: { type: "SUPERMAJORITY" },
  },
  // Votes registry (proposals)
  votes: [],
  // Proxies registry
  proxies: [],
  // Attestations
  attestations: [
    {
      id: "VE_MANIFEST_ATTESTATION",
      title: "Verification Exception Manifest Attestation",
      status: "PENDING",
      signedBy: [], // {address, signature, signedAt}
      createdAt: Date.now(),
    },
  ],
  // Docs (for Document Vault)
  docs: [
    {
      id: "VE_MANIFEST_V1",
      title: "MODX Verification Exception Manifest v1.0 (SEALED)",
      status: "SEALED",
      body:
`SCOPE: Residential Registry + MODUSDtETF
STATUS: SEALED
GOVERNANCE: Trustee attestation supersedes explorer tooling.
FINALITY: Permanent satisfaction of verification requirements.`,
    },
    {
      id: "PUBLIC_TRUST_NOTICE_V1",
      title: "Verification Status & Governance Notice (Public)",
      status: "READY",
      body:
`Certain smart contracts operated under AG Holdings Trust were deployed prior to current verification tooling standards.
These contracts are immutable and governed under trustee oversight...`,
    },
  ],
};

// ---------------------------
// STATE LOAD/SAVE
// ---------------------------
function load() {
  return readJSON("trustee_state", DEFAULT_STATE);
}
function save(state) {
  writeJSON("trustee_state", state);
}

export function getState() {
  return load();
}

export function setState(mutatorFn) {
  const s = load();
  const next = mutatorFn(s) || s;
  save(next);
  return next;
}

// ---------------------------
// TRUSTEES
// ---------------------------
export async function getTrusteeByAddress(address) {
  const s = load();
  const a = (address || "").toLowerCase();
  return s.trustees.find((t) => t.address.toLowerCase() === a && t.status === "ACTIVE") || null;
}

export function listActiveTrustees() {
  const s = load();
  return s.trustees.filter((t) => t.status === "ACTIVE" && t.role === "TRUSTEE");
}

export function quorumRequired(actionType = "STANDARD") {
  const s = load();
  const active = listActiveTrustees().length;
  const policy = s.quorumPolicy[actionType] || s.quorumPolicy.STANDARD;
  return computeQuorum(active, policy);
}

// ---------------------------
// DOCS
// ---------------------------
export async function listDocs() {
  const s = load();
  return s.docs.map(({ body, ...rest }) => rest);
}
export async function getDoc(id) {
  const s = load();
  return s.docs.find((d) => d.id === id) || null;
}

// ---------------------------
// NONCES (kept in-memory, ok)
const NONCES = new Map();
export async function storeNonce(address, nonce) {
  NONCES.set(address.toLowerCase(), { nonce, createdAt: Date.now() });
}
export async function consumeNonce(address, message) {
  const rec = NONCES.get(address.toLowerCase());
  if (!rec) return false;
  if (!message.includes(`Nonce: ${rec.nonce}`)) return false;
  NONCES.delete(address.toLowerCase());
  return true;
}

// ---------------------------
// VOTES / PROXIES / ATTESTATIONS
// ---------------------------
export function listVotes() {
  return load().votes;
}
export function getVote(id) {
  return load().votes.find((v) => v.id === id) || null;
}

export function createVote(vote) {
  return setState((s) => {
    s.votes.unshift(vote);
    return s;
  });
}

export function updateVote(id, updater) {
  return setState((s) => {
    const idx = s.votes.findIndex((v) => v.id === id);
    if (idx === -1) return s;
    s.votes[idx] = updater(s.votes[idx]);
    return s;
  });
}

export function listProxies() {
  return load().proxies;
}

export function createProxy(proxy) {
  return setState((s) => {
    s.proxies.unshift(proxy);
    return s;
  });
}

export function revokeProxy(id) {
  return setState((s) => {
    s.proxies = s.proxies.map((p) => (p.id === id ? { ...p, status: "REVOKED" } : p));
    return s;
  });
}

export function listAttestations() {
  return load().attestations;
}

export function signAttestation(id, signedRecord) {
  return setState((s) => {
    const a = s.attestations.find((x) => x.id === id);
    if (!a) return s;
    if (a.signedBy.some((r) => r.address.toLowerCase() === signedRecord.address.toLowerCase())) return s;
    a.signedBy.push(signedRecord);
    // Mark complete if meets quorum
    const required = quorumRequired("ATTESTATION");
    if (a.signedBy.length >= required) a.status = "COMPLETE";
    return s;
  });
}
