"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const queueDir = process.env.INTAKE_QUEUE_PATH || "/mnt/c/Users/mialo/AGVault/investment/queue";
const registryDir = process.env.DAO_REGISTRY_PATH || "/mnt/c/Users/mialo/AGVault/dao/registry";

function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => ({ file: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a,b) => b.mtime - a.mtime)
    .slice(0, 100);
}

router.get("/queue", (_req, res) => {
  res.json({ ok: true, dir: queueDir, items: listJson(queueDir) });
});

router.get("/commits", (_req, res) => {
  res.json({ ok: true, dir: registryDir, items: listJson(registryDir) });
});

router.get("/commit/:file", (req, res) => {
  const p = path.join(registryDir, req.params.file);
  if (!p.startsWith(registryDir)) return res.status(400).json({ ok:false, error:"Invalid path" });
  if (!fs.existsSync(p)) return res.status(404).json({ ok:false, error:"Not found" });
  res.json({ ok: true, data: JSON.parse(fs.readFileSync(p, "utf8")) });
});

module.exports = router;
