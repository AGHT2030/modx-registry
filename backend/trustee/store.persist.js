import fs from "fs";
import path from "path";

/**
 * =========================================================
 * FILE-BACKED STATE PERSISTENCE
 * Writes trustee_state.json to backend/trustee/data/
 * =========================================================
 */

const DATA_DIR = path.resolve(
  process.cwd(),
  "backend",
  "trustee",
  "data"
);

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(name) {
  ensureDir();
  return path.join(DATA_DIR, `${name}.json`);
}

export function readJSON(name, fallback) {
  try {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) {
      return fallback;
    }
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch (err) {
    console.error("Failed to read JSON state:", err);
    return fallback;
  }
}

export function writeJSON(name, obj) {
  try {
    const fp = filePath(name);
    fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error("Failed to write JSON state:", err);
  }
}
