/**
 * MODX CloudWatch EMF Logger (Node.js)
 * © 2026 AG Holdings Trust | MODX Sovereign Technologies — Internal & Confidential
 *
 * Purpose:
 * - Emit CloudWatch Embedded Metric Format (EMF) JSON to stdout
 * - CloudWatch Logs can extract metrics automatically (no separate PutMetricData needed)
 *
 * Notes:
 * - Do NOT log PII (raw IP, email, phone, name, etc.)
 * - Prefer hashed identifiers (ip_hash, ua_hash) upstream
 */

/**
 * Emit an EMF payload to stdout.
 *
 * @param {Object} opts
 * @param {string} opts.namespace - CloudWatch Namespace (e.g., "MODX/Intake")
 * @param {Object} opts.dimensions - Dimension key/values (e.g., { service: "poa-verifier", env: "prod" })
 * @param {Object} opts.metrics - Metric key/values (numbers only) (e.g., { IntakeSubmissions: 1, RiskScore: 0.18 })
 * @param {number} [opts.timestampMs] - Optional epoch ms override
 */
export function logEmf({ namespace, dimensions, metrics, timestampMs }) {
  if (!namespace || typeof namespace !== "string") {
    throw new Error("logEmf: namespace is required");
  }
  if (!dimensions || typeof dimensions !== "object") {
    throw new Error("logEmf: dimensions object is required");
  }
  if (!metrics || typeof metrics !== "object") {
    throw new Error("logEmf: metrics object is required");
  }

  const ts = Number.isFinite(timestampMs) ? timestampMs : Date.now();

  // CloudWatch EMF expects Dimensions as an array of dimension-name arrays
  const dimKeys = Object.keys(dimensions);

  // Build metric definitions (CloudWatch extracts these names)
  const metricDefs = Object.keys(metrics).map((name) => ({
    Name: name,
    Unit: inferUnit(name),
  }));

  // Ensure all metric values are numeric
  const cleanMetrics = {};
  for (const [k, v] of Object.entries(metrics)) {
    const num = Number(v);
    if (!Number.isFinite(num)) continue;
    cleanMetrics[k] = num;
  }

  const payload = {
    _aws: {
      Timestamp: ts,
      CloudWatchMetrics: [
        {
          Namespace: namespace,
          Dimensions: [dimKeys],
          Metrics: metricDefs,
        },
      ],
    },
    ...dimensions,
    ...cleanMetrics,
  };

  // Print as single-line JSON for log extraction
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

/**
 * Convenience wrappers for common MODX namespaces.
 */
export function logIntakeMetrics(dimensions, metrics) {
  return logEmf({ namespace: "MODX/Intake", dimensions, metrics });
}

export function logPoaMetrics(dimensions, metrics) {
  return logEmf({ namespace: "MODX/POA", dimensions, metrics });
}

export function logAnomalyMetrics(dimensions, metrics) {
  return logEmf({ namespace: "MODX/Anomaly", dimensions, metrics });
}

/**
 * Simple unit inference (CloudWatch is flexible; "None" is acceptable for most).
 * Customize as needed, but do not change metric names without Compliance approval.
 */
function inferUnit(metricName) {
  const name = metricName.toLowerCase();

  if (name.includes("count") || name.includes("attempt") || name.includes("submission")) return "Count";
  if (name.includes("rate") || name.includes("ratio")) return "None";
  if (name.includes("latency") || name.includes("ms")) return "Milliseconds";

  return "None";
}

/**
 * Example usage (remove in production):
 *
 * logPoaMetrics(
 *   { service: "poa-verifier", env: "prod" },
 *   { IntakeSubmissions: 1, InvalidSigRate: 0.02, ReplayAttempts: 0, RiskScore: 0.18 }
 * );
 */
