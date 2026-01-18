import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "backend/trustee/data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  ensureDir();
  return path.join(DATA_DIR, `${name}.json`);
}

export function readJSON(name, fallback) {
  try {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) return fallback;
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return fallback;
  }
}

export function writeJSON(name, obj) {
  const fp = filePath(name);
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
}
