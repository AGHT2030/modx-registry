"use strict";

async function daoCommit({ commitUrl, envelope, apiKey }) {
  const url = commitUrl || process.env.DAO_COMMIT_URL || "http://127.0.0.1:8090/api/dao/commit";

  const headers = {
    "Content-Type": "application/json",
    "x-modlink-proof": "service-internal",
    "x-requested-by": "INVEST"
  };

  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(envelope)
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    const err = new Error(`DAO commit failed: ${res.status}`);
    err.status = res.status;
    err.dao = data;
    throw err;
  }

  return data;
}

module.exports = { daoCommit };
