/** Pauses execution for `ms` milliseconds. */
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * Fetches a Roblox API URL, retrying with exponential back-off on 429s before
 * falling back to the roproxy.com mirror.
 *
 * Retry schedule (per domain):
 *   attempt 1 — immediate
 *   attempt 2 — wait 1 s
 *   attempt 3 — wait 2 s
 * If all three attempts on roblox.com fail (429 or other error), the same
 * schedule is applied to the roproxy.com mirror. Only then does it throw.
 *
 * @param url          - Canonical roblox.com endpoint URL
 * @param cacheOptions - Pass `{ noStore: true }` for routes that cache their
 *                       own response via `export const revalidate`; otherwise
 *                       supply `{ revalidate: N }` for per-URL Data Cache.
 */
export async function robloxFetch<T>(
    url: string,
    cacheOptions: { revalidate: number } | { noStore: true } = { revalidate: 86400 },
): Promise<T> {
    const RETRIES   = 3;
    const DELAYS_MS = [0, 1_000, 2_000];

    const primaryOpts: RequestInit = {
        headers: { Accept: 'application/json' },
        ...('noStore' in cacheOptions
            ? { cache: 'no-store' }
            : { next: { revalidate: cacheOptions.revalidate } }),
    };

    /** Attempts a URL up to RETRIES times, backing off on 429. */
    async function attempt(targetUrl: string, opts: RequestInit): Promise<Response | null> {
        for (let i = 0; i < RETRIES; i++) {
            if (DELAYS_MS[i]) await sleep(DELAYS_MS[i]);
            const res = await fetch(targetUrl, opts);
            if (res.status !== 429) return res;  // ok or a real error — stop retrying
            console.warn(`[robloxFetch] 429 on ${targetUrl} (attempt ${i + 1}/${RETRIES})`);
        }
        return null; // exhausted retries, all were 429
    }

    // — Primary: roblox.com ————————————————————————————————————————————
    const res = await attempt(url, primaryOpts);

    if (res?.ok) return res.json() as Promise<T>;

    // — Fallback: roproxy.com ——————————————————————————————————————————
    const proxyUrl = url.replace('roblox.com', 'roproxy.com');
    console.warn(`[robloxFetch] primary failed (${res?.status ?? '429×3'}) — trying roproxy: ${proxyUrl}`);

    const proxyRes = await attempt(proxyUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    });

    if (proxyRes?.ok) return proxyRes.json() as Promise<T>;

    throw new Error(
        `Roblox API unreachable — roblox: ${res?.status ?? '429×3'}, roproxy: ${proxyRes?.status ?? '429×3'} (${proxyUrl})`
    );
}
