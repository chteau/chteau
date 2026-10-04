import { NextRequest, NextResponse } from 'next/server';
import { robloxFetch } from '../utils';

interface RobloxUserInfo {
    id: number;
    name: string;
    displayName: string;
    hasVerifiedBadge: boolean;
}

interface RobloxThumbnailEntry {
    targetId: number;
    imageUrl: string;
    state: string;
}

/**
 * Returns username, display name, verified badge, and avatar for a batch of
 * arbitrary Roblox user IDs — used by the "Spotlight" section, which shows
 * off specific community members rather than the site owner's own profile.
 */
export async function GET(request: NextRequest) {
    const userIdsParam = request.nextUrl.searchParams.get('userIds');

    if (!userIdsParam) {
        return NextResponse.json({ error: 'Missing userIds parameter' }, { status: 400 });
    }

    const userIds = userIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);

    try {
        const [usersRes, thumbsRes] = await Promise.all([
            robloxFetch<{ data: RobloxUserInfo[] }>(
                'https://users.roblox.com/v1/users',
                { revalidate: 86400 },
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userIds, excludeBannedUsers: false }),
                }
            ),
            robloxFetch<{ data: RobloxThumbnailEntry[] }>(
                `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIdsParam}&size=150x150&format=Png&isCircular=false`
            ),
        ]);

        const thumbMap = new Map(thumbsRes.data.map((t) => [t.targetId, t.imageUrl]));
        const result = usersRes.data.map((u) => ({
            id: u.id,
            username: u.name,
            displayName: u.displayName,
            hasVerifiedBadge: u.hasVerifiedBadge,
            avatarUrl: thumbMap.get(u.id) ?? null,
        }));

        return NextResponse.json({ data: result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching Roblox spotlight users:', message);
        return NextResponse.json({ error: 'Failed to fetch users', message }, { status: 500 });
    }
}
