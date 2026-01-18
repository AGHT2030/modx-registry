export const ROLES = {
  TRUSTEE: "TRUSTEE",
  COUNSEL_READONLY: "COUNSEL_READONLY",
  TRUST_ADMIN: "TRUST_ADMIN",
};

export function requireRole(user, allowed) {
  if (!user?.role) return false;
  return allowed.includes(user.role);
}

/**
 * Quorum policy:
 * - "MAJORITY": >50% of ACTIVE trustees
 * - "SUPERMAJORITY": >= 2/3 of ACTIVE trustees (rounded up)
 * - "FIXED_N": fixed number, e.g. 2
 */
export function computeQuorum(activeTrusteesCount, policy) {
  if (!policy || policy.type === "MAJORITY") {
    return Math.floor(activeTrusteesCount / 2) + 1;
  }
  if (policy.type === "SUPERMAJORITY") {
    return Math.ceil((2 / 3) * activeTrusteesCount);
  }
  if (policy.type === "FIXED_N") {
    return Math.min(activeTrusteesCount, Math.max(1, policy.n || 1));
  }
  return Math.floor(activeTrusteesCount / 2) + 1;
}
