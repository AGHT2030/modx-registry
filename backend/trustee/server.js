import express from "express";
import cors from "cors";
import { authRouter } from "./auth.js";
import { requireJWT } from "./auth.js";
import { docsRouter } from "./routes.docs.js";
import govRouter from "./routes.gov.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_, res) => res.json({ ok: true, service: "trustee-portal" }));

app.use("/api/trustee/auth", authRouter);

app.get("/api/trustee/me", requireJWT, (req, res) => {
    res.json({ address: req.user.address, role: req.user.role, trusteeId: req.user.trusteeId });
});

app.use("/api/trustee/docs", requireJWT, docsRouter);
app.use("/api/trustee/gov", requireJWT, govRouter);

const PORT = process.env.TRUSTEE_PORT || 8088;
app.listen(PORT, () => console.log(`Trustee portal API on :${PORT}`));