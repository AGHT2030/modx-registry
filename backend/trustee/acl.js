/**
 * =========================================================
 * ACCESS CONTROL + QUORUM LOGIC
 * =========================================================
 */

export const ROLES = {
  TRUSTEE: "TRUSTEE",
  COUNSEL_READONLY: "COUNSEL_READONLY",
  TRUST_ADMIN: "TRUST_ADMIN",
};

/**
 * Check whether a user has one of the allowed roles
 */
export function requireRole(user, allowedRoles = []) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Compute quorum requirement based on policy
 *
 * Policies supported:
 * - MAJORITY: >50% of active trustees
 * - SUPERMAJORITY: >= 2/3 of active trustees (rounded up)
 * - FIXED_N: fixed number (min 1, max active trustees)
 */
export function computeQuorum(activeTrusteesCount, policy) {
  if (!activeTrusteesCount || activeTrusteesCount <= 0) return 0;

  if (!policy || policy.type === "MAJORITY") {
    return Math.floor(activeTrusteesCount / 2) + 1;
  }

  if (policy.type === "SUPERMAJORITY") {
    return Math.ceil((2 / 3) * activeTrusteesCount);
  }

  if (policy.type === "FIXED_N") {
    const n = policy.n || 1;
    return Math.min(activeTrusteesCount, Math.max(1, n));
  }

  // Fallback safety
  return Math.floor(activeTrusteesCount / 2) + 1;
}
