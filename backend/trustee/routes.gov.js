/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 *
 * Trustee Governance Routes (READ + EXECUTION)
 */

import express from "express";
import {
  getTrusteeByAddress,
  listActiveTrustees,
  quorumRequired,
  getState
} from "./store.js";

const govRouter = express.Router();

/* -------------------------------------------------------
   🔹 READ-ONLY GOVERNANCE STATUS (CoinPurse-safe)
------------------------------------------------------- */

govRouter.get("/status", async (req, res) => {
  try {
    const trustees = listActiveTrustees();

    res.json({
      ok: true,
      activeTrustees: trustees.length,
      quorum: {
        STANDARD: quorumRequired("STANDARD"),
        EMERGENCY_REPLACEMENT: quorumRequired("EMERGENCY_REPLACEMENT"),
        CHANGE_QUORUM_POLICY: quorumRequired("CHANGE_QUORUM_POLICY"),
        ATTESTATION: quorumRequired("ATTESTATION")
      },
      sealedDocs: getState().docs?.filter(d => d.status === "SEALED") || [],
      ts: Date.now()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* -------------------------------------------------------
   🔹 READ-ONLY TRUSTEE ROLE CHECK
------------------------------------------------------- */

govRouter.get("/is-trustee/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const trustee = await getTrusteeByAddress(address);

    res.json({
      ok: true,
      address,
      isTrustee: !!trustee,
      role: trustee?.role || null,
      status: trustee?.status || null
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* -------------------------------------------------------
   🔹 (EXISTING EXECUTION ROUTES STAY BELOW)
   DO NOT MOVE OR MODIFY THEM
------------------------------------------------------- */

// Any existing approve / reject / execute / emergency routes
// remain exactly where they already were in your file

export default govRouter;
