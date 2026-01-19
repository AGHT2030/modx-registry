# Architecture Overview — Governed Financial Infrastructure

MODX is architected as a layered financial infrastructure system separating governance, authority, routing, execution, custody, and observability.

## Architecture Layers

### Governance Layer (Trust-Controlled)
AG Holdings Trust (AGHT) oversight, trustee authority, compliance enforcement, escalation, and long-term continuity.

### Authority Layer (Proof-of-Authority)
Explicit issuance of execution authority with scope limits, time bounds, revocation, and emergency suspension.

### Governing Router Layer (MODLINK)
Policy-enforced execution routing connecting governance decisions to live execution and emitting immutable telemetry.

### Execution Layer
Intake, verification, and settlement services operating only under valid authority.

### Governance Custody & Access Layer (CoinPurse)
Trustee-controlled custody of authority materials and digital key activation.

### Observability & Audit Layer
Immutable event logging, real-time telemetry, anomaly detection, and audit-ready records.

This separation enables innovation without sacrificing governance.
