/**
 * MODX Express EMF Middleware
 * © 2026 AG Holdings Trust | MODX Sovereign Technologies
 *
 * Purpose:
 * - Emit CloudWatch EMF metrics for HTTP requests
 * - Track volume, latency, and success/failure
 * - NO PII logging
 */

const {
  logIntakeMetrics,
} = require("../../docs/observability/node_cloudwatch_emf_logger.js");

module.exports = function emfIntakeMetrics(serviceName = "intake-api") {
  return function (req, res, next) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      try {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;

        const isError = res.statusCode >= 400;

        logIntakeMetrics(
          {
            service: serviceName,
            env: process.env.NODE_ENV || "prod",
          },
          {
            IntakeRequests: 1,
            IntakeErrors: isError ? 1 : 0,
            IntakeLatencyMs: durationMs,
          }
        );
      } catch (err) {
        // observability must never break the request
        console.error("⚠️ EMF middleware error:", err.message);
      }
    });

    next();
  };
};
