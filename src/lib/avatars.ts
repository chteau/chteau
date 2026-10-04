import { robloxFetch } from '../app/api/roblox/utils';

/** Extracts a username from a validated `github.com/<username>` profile URL. */
export function githubUsernameFromUrl(url: string): string | null {
    const match = url.match(/^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/?$/);
    return match ? match[1] : null;
}

/** Extracts the numeric user ID from a validated `roblox.com/users/<id>/...` profile URL. */
export function robloxUserIdFromUrl(url: string): string | null {
    const match = url.match(/^https:\/\/(?:www\.)?roblox\.com\/users\/(\d+)/);
    return match ? match[1] : null;
}

interface RobloxThumbnailResponse {
    data: Array<{ targetId: number; imageUrl: string; state: string }>;
}

/**
 * Resolves a profile picture for whichever link was provided — GitHub takes
 * priority (a direct, stable CDN URL, no API call needed), Roblox as a
 * fallback (one call to Roblox's public avatar-headshot thumbnail API).
 * Returns `undefined` if neither link is usable or the lookup fails.
 */
export async function resolveAvatarUrl(githubUrl?: string, robloxUrl?: string): Promise<string | undefined> {
    if (githubUrl) {
        const username = githubUsernameFromUrl(githubUrl);
        if (username) return `https://github.com/${username}.png`;
    }

    if (robloxUrl) {
        const userId = robloxUserIdFromUrl(robloxUrl);
        if (userId) {
            try {
                const res = await robloxFetch<RobloxThumbnailResponse>(
                    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
                    { noStore: true }
                );
                const entry = res.data?.[0];
                if (entry?.state === 'Completed' && entry.imageUrl) return entry.imageUrl;
            } catch (err) {
                console.warn('[avatars] Failed to resolve Roblox avatar:', err);
            }
        }
    }

    return undefined;
}
