import { readJSON, writeJSON } from "./store.persist.js";
import { computeQuorum } from "./acl.js";

/**
 * =========================================================
 * DEFAULT / GENESIS STATE (Constitutional Law)
 * This is written ONCE to trustee_state.json on first boot.
 * =========================================================
 */

const DEFAULT_STATE = {
  trustees: [
    {
      id: "TRUSTEE_01",
      address: "0xAAA...AAA",
      role: "TRUSTEE",
      status: "ACTIVE",
    },
    {
      id: "TRUSTEE_02",
      address: "0xBBB...BBB",
      role: "TRUSTEE",
      status: "ACTIVE",
    },
    {
      id: "TRUSTEE_03",
      address: "0xCCC...CCC",
      role: "TRUSTEE",
      status: "ACTIVE",
    },
  ],

  quorumPolicy: {
    STANDARD: { type: "MAJORITY" },
    EMERGENCY_REPLACEMENT: { type: "SUPERMAJORITY" },
    CHANGE_QUORUM_POLICY: { type: "SUPERMAJORITY" },
  },

  votes: [],

  proxies: [],

  attestations: [
    {
      id: "VE_MANIFEST_ATTESTATION",
      title: "Verification Exception Manifest Attestation",
      status: "PENDING",
      signedBy: [],
      createdAt: Date.now(),
    },
  ],

  docs: [
    {
      id: "VE_MANIFEST_V1",
      title: "MODX Verification Exception Manifest v1.0 (SEALED)",
      status: "SEALED",
      body: `SCOPE: Residential Registry + MODUSDtETF
STATUS: SEALED
GOVERNANCE: Trustee attestation supersedes explorer tooling.
FINALITY: Permanent satisfaction of verification requirements.`,
    },
    {
      id: "PUBLIC_TRUST_NOTICE_V1",
      title: "Verification Status & Governance Notice (Public)",
      status: "READY",
      body: `Certain smart contracts operated under AG Holdings Trust were deployed prior to current verification tooling standards...
(Full public notice text goes here)`,
    },
  ],
};

/**
 * =========================================================
 * STATE LOAD / SAVE
 * =========================================================
 */

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
  const state = load();
  const next = mutatorFn(state) || state;
  save(next);
  return next;
}

/**
 * =========================================================
 * TRUSTEES
 * =========================================================
 */

export async function getTrusteeByAddress(address) {
  const a = address?.toLowerCase();
  if (!a) return null;
  return load().trustees.find(
    (t) => t.address.toLowerCase() === a && t.status === "ACTIVE"
  ) || null;
}

export function listActiveTrustees() {
  return load().trustees.filter(
    (t) => t.role === "TRUSTEE" && t.status === "ACTIVE"
  );
}

export function quorumRequired(actionType = "STANDARD") {
  const state = load();
  const activeCount = listActiveTrustees().length;
  const policy = state.quorumPolicy[actionType] || state.quorumPolicy.STANDARD;
  return computeQuorum(activeCount, policy);
}

/**
 * =========================================================
 * NONCES (IN-MEMORY, SAFE)
 * =========================================================
 */

const NONCES = new Map();

export async function storeNonce(address, nonce) {
  NONCES.set(address.toLowerCase(), {
    nonce,
    createdAt: Date.now(),
  });
}

export async function consumeNonce(address, message) {
  const rec = NONCES.get(address.toLowerCase());
  if (!rec) return false;
  if (!message.includes(`Nonce: ${rec.nonce}`)) return false;
  NONCES.delete(address.toLowerCase());
  return true;
}

/**
 * =========================================================
 * DOCUMENTS
 * =========================================================
 */

export async function listDocs() {
  return load().docs.map(({ body, ...rest }) => rest);
}

export async function getDoc(id) {
  return load().docs.find((d) => d.id === id) || null;
}

/**
 * =========================================================
 * VOTES
 * =========================================================
 */

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

/**
 * =========================================================
 * PROXIES
 * =========================================================
 */

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
    s.proxies = s.proxies.map((p) =>
      p.id === id ? { ...p, status: "REVOKED" } : p
    );
    return s;
  });
}

/**
 * =========================================================
 * ATTESTATIONS
 * =========================================================
 */

export function listAttestations() {
  return load().attestations;
}

export function signAttestation(id, signedRecord) {
  return setState((s) => {
    const a = s.attestations.find((x) => x.id === id);
    if (!a) return s;

    if (
      a.signedBy.some(
        (r) => r.address.toLowerCase() === signedRecord.address.toLowerCase()
      )
    ) {
      return s;
    }

    a.signedBy.push(signedRecord);

    const required = quorumRequired("ATTESTATION");
    if (a.signedBy.length >= required) {
      a.status = "COMPLETE";
    }

    return s;
  });
}

