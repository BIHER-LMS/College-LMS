interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  coalesced: number;
  size: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private readonly maxEntries: number;
  private hits = 0;
  private misses = 0;
  private coalesced = 0;

  constructor(maxEntries: number = 5000) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    if (process.env.NODE_ENV === 'test' && !process.env.ENABLE_TEST_CACHE) {
      return null;
    }

    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    // Evict expired entries or oldest if limit reached
    if (this.store.size >= this.maxEntries) {
      this.pruneExpired();
      if (this.store.size >= this.maxEntries) {
        // Evict oldest inserted entry (first key in Map iterator)
        const oldestKey = this.store.keys().next().value;
        if (oldestKey) this.store.delete(oldestKey);
      }
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Single-Flight Request Collapsing (Promise Deduplication / Thundering Herd Prevention)
   *
   * If 1,000 users fetch the same API at the exact same millisecond on a cache miss:
   * - Request 1 initiates the database query.
   * - Requests 2 through 1,000 do NOT query the database; they coalesce onto the same in-flight Promise.
   * - Once Request 1 finishes, all 1,000 requests resolve with the identical result in parallel.
   * - Database connection pool is preserved (1 query instead of 1,000 queries!).
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      this.coalesced++;
      return pending as Promise<T>;
    }

    const promise = (async () => {
      try {
        const result = await fetchFn();
        this.set(key, result, ttlSeconds);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  del(key: string): void {
    this.store.delete(key);
    this.inFlight.delete(key);
  }

  delPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
    for (const key of this.inFlight.keys()) {
      if (regex.test(key)) {
        this.inFlight.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
    this.inFlight.clear();
    this.hits = 0;
    this.misses = 0;
    this.coalesced = 0;
  }

  size(): number {
    return this.store.size;
  }

  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      coalesced: this.coalesced,
      size: this.store.size,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();
