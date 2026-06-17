import { NextResponse } from 'next/server';
import { robloxFetch } from '../utils';

export const revalidate = 86400;

const USER_ID = process.env.ROBLOX_USER_ID ?? '925308243';

/**
 * Returns the Roblox user profile and avatar headshot for the configured user ID.
 * Response is cached server-wide for 24 h via `export const revalidate`.
 * Each upstream fetch also carries its own 24 h Data Cache entry and falls back
 * to roproxy.com on any Roblox error.
 */
export async function GET() {
    try {
        const [user, avatarData] = await Promise.all([
            robloxFetch<{
                name: string;
                displayName: string;
                hasVerifiedBadge: boolean;
            }>(`https://users.roblox.com/v1/users/${USER_ID}`),

            robloxFetch<{
                data: { state: string; imageUrl: string }[];
            }>(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${USER_ID}&size=420x420&format=Png&isCircular=false`),
        ]);

        const avatarEntry = avatarData.data?.find(e => e.state === 'Completed');

        return NextResponse.json({
            username:         user.name,
            displayName:      user.displayName,
            hasVerifiedBadge: user.hasVerifiedBadge ?? false,
            avatarUrl:        avatarEntry?.imageUrl ?? null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching Roblox profile:', message);
        return NextResponse.json({ error: 'Failed to fetch profile', message }, { status: 500 });
    }
}
