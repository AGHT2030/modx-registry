import express from "express";
import { listDocs, getDoc } from "./store.js";

export const docsRouter = express.Router();

docsRouter.get("/", async (req, res) => {
  const items = await listDocs();
  res.json({ items });
});

docsRouter.get("/:id", async (req, res) => {
  const doc = await getDoc(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});
