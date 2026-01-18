/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * Nonce store (replay protection) — in-memory TTL
 */

class NonceStore {
  constructor({ ttlSeconds = 900, maxSize = 200000 } = {}) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxSize = maxSize;
    this.map = new Map(); // nonce -> expiresAtMs
    this._lastSweep = 0;
  }

  _sweep() {
    const now = Date.now();
    if (now - this._lastSweep < 30_000) return;
    this._lastSweep = now;

    for (const [nonce, exp] of this.map.entries()) {
      if (exp <= now) this.map.delete(nonce);
    }
    // Size guard (drop oldest-ish by iter order)
    while (this.map.size > this.maxSize) {
      const firstKey = this.map.keys().next().value;
      if (!firstKey) break;
      this.map.delete(firstKey);
    }
  }

  seen(nonce) {
    this._sweep();
    const now = Date.now();
    const exp = this.map.get(nonce);
    if (exp && exp > now) return true;
    return false;
  }

  mark(nonce) {
    this._sweep();
    this.map.set(nonce, Date.now() + this.ttlMs);
  }
}

module.exports = { NonceStore };
