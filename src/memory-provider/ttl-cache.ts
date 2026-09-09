/**
 * Bounded TTL cache for recall results.
 * Hardening: prevents thundering herd on remote providers during high fan-in.
 * Simple Map + timestamp sweep (no external deps).
 */

export interface TTLCacheOptions {
  maxEntries?: number;
  ttlMs?: number;
}

export class TTLCache<K, V> {
  private readonly map = new Map<K, { value: V; expiresAt: number }>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(options: TTLCacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? 500;
    this.ttlMs = options.ttlMs ?? 30_000; // 30s default for recall hot path
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.map.size >= this.maxEntries) {
      // Evict oldest (simple FIFO sweep)
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) this.map.delete(firstKey);
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    // Opportunistic cleanup
    const now = Date.now();
    for (const [k, v] of this.map) {
      if (now > v.expiresAt) this.map.delete(k);
    }
    return this.map.size;
  }
}
