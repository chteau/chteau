import { getStore } from '@netlify/blobs';

/**
 * Reads a JSON blob, degrading to `fallback` when Netlify Blobs has no
 * site/deploy context (auto-injected on Netlify; absent in plain `next dev`
 * without the Netlify CLI) rather than throwing — every public GET backed by
 * a blob store should stay up even then.
 */
export async function readJsonBlob<T>(storeName: string, key: string, fallback: T): Promise<T> {
    try {
        const store = getStore(storeName);
        const data = await store.get(key, { type: 'json' });
        return data === null || data === undefined ? fallback : (data as T);
    } catch (err) {
        console.warn(`[${storeName}] Netlify Blobs unavailable, returning fallback for "${key}":`, err);
        return fallback;
    }
}
