import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { robloxFetch } from '../utils';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const USER_ID = process.env.ROBLOX_USER_ID ?? '925308243';
const MIN_RANK = parseInt(process.env.MINIMUM_RANK_REQUIRED ?? '189', 10); // 189 is the lowest rank I came across as an active contributor in a game

/** Fetch options — no Next.js Data Cache on individual calls; the outer
 *  unstable_cache handles the 24 h memoisation at the computation level. */
const FETCH_OPTS = { noStore: true } as const;

/**
 * Returns all groups where the user holds a rank >= MIN_RANK.
 */
async function getContributedGroups(): Promise<{ id: number; name: string }[]> {
    const data = await robloxFetch<{
        data: { group: { id: number; name: string }; role: { rank: number } }[];
    }>(`https://groups.roblox.com/v1/users/${USER_ID}/groups/roles`, FETCH_OPTS);

    return data.data
        .filter(d => d.role.rank >= MIN_RANK)
        .map(d => ({ id: d.group.id, name: d.group.name }));
}

/**
 * Recursively walks the paginated public-game list for one group and sums visits.
 */
async function getGroupVisits(groupId: number, cursor: string | null = null, acc = 0): Promise<number> {
    const url = `https://games.roblox.com/v2/groups/${groupId}/gamesv2?accessFilter=Public&cursor=${cursor ?? ''}&limit=100&sortOrder=Desc`;
    const data = await robloxFetch<{
        nextPageCursor: string | null;
        data: { placeVisits: number }[];
    }>(url, FETCH_OPTS);

    const pageTotal = data.data.reduce((sum, g) => sum + (g.placeVisits > 0 ? g.placeVisits : 0), 0);
    const total = acc + pageTotal;

    if (data.nextPageCursor) return getGroupVisits(groupId, data.nextPageCursor, total);
    return total;
}

/**
 * The expensive computation, wrapped in unstable_cache so it runs at most once
 * per 24 h in production regardless of how many requests arrive.
 *
 * unstable_cache operates at the Next.js cache layer — unlike `export const
 * revalidate`, it is NOT defeated by `cache: 'no-store'` on inner fetches.
 * Note: in development (`next dev`) Next.js never caches; re-fetches on every
 * request are expected there.
 */
const computeContributedVisits = unstable_cache(
    async (): Promise<number> => {
        const groups = await getContributedGroups();

        let total = 0;
        for (const group of groups) {
            try {
                total += await getGroupVisits(group.id);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`[visits] Skipping group ${group.id} (${group.name}): ${msg}`);
            }
            await sleep(500); // pace requests to stay below Roblox's anonymous rate limit
        }

        return total;
    },
    ['roblox-contributed-visits'],
    { revalidate: 86400 },
);

/**
 * Returns the total contributed visits for the configured Roblox user.
 * Response is computed at most once per 24 h (production only).
 */
export async function GET() {
    try {
        const totalContributedVisits = await computeContributedVisits();
        return NextResponse.json({ userID: USER_ID, totalContributedVisits });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching Roblox visits:', message);
        return NextResponse.json({ error: 'Failed to fetch visits', message }, { status: 500 });
    }
}
