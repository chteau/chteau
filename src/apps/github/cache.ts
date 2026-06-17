/**
 * Module-level session cache shared across all GitHub app tabs.
 *
 * Entries live in memory for the entire page session — no TTL, no expiry.
 * The Map is cleared automatically when the user navigates away or closes
 * the tab, so stale data never persists across visits.
 */
const store = new Map<string, unknown>();

/**
 * Retrieves a typed entry from the session cache.
 *
 * @param key - Cache key
 * @returns The cached value cast to T, or undefined on a miss
 */
export function cacheGet<T>(key: string): T | undefined {
    return store.get(key) as T | undefined;
}

/**
 * Stores a value in the session cache under the given key.
 * Overwrites any existing entry for that key.
 *
 * @param key - Cache key
 * @param data - Value to cache
 */
export function cacheSet(key: string, data: unknown): void {
    store.set(key, data);
}
