type CacheEntry<T> = { value: T; expiresAt: number };

export class InMemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) return undefined;
    return entry.value as T;
  }

  getStale<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    return entry?.value as T | undefined;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export const globalCache = new InMemoryCache();


