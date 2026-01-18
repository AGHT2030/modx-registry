/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * POA Risk Scoring (Phase 1) — deterministic
 */

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/**
 * Inputs are recent-window metrics (e.g., last 5 minutes)
 */
function scorePoa({ invalidSigRate = 0, replayAttempts = 0, intakeRate = 0 } = {}) {
  // Weight replay heavily, invalid sig strongly, intake velocity moderately
  const score =
    (invalidSigRate * 0.65) +
    (clamp01(replayAttempts / 3) * 0.9) +
    (clamp01(intakeRate / 200) * 0.25);

  return clamp01(score);
}

module.exports = { scorePoa };
