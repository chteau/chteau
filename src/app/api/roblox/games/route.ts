import { NextRequest, NextResponse } from 'next/server';
import { robloxFetch } from '../utils';

/**
 * Returns live game stats (visits, playing, favorites) for the given universe IDs.
 * Upstream fetch is cached for 24 h and falls back to roproxy.com on error.
 */
export async function GET(request: NextRequest) {
    const universeIdsParam = request.nextUrl.searchParams.get('universeIds');

    if (!universeIdsParam) {
        return NextResponse.json({ error: 'Missing universeIds parameter' }, { status: 400 });
    }

    try {
        const data = await robloxFetch<{
            data: {
                id: number;
                description: string;
                visits: number;
                playing: number;
                favoritedCount: number;
            }[];
        }>(`https://games.roblox.com/v1/games?universeIds=${universeIdsParam}`);

        const result: Record<string, { visits: number; playing: number; favorites: number; description: string }> = {};
        for (const game of data.data) {
            result[game.id.toString()] = {
                visits:      game.visits,
                playing:     game.playing,
                favorites:   game.favoritedCount,
                description: game.description ?? '',
            };
        }

        return NextResponse.json({ data: result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching Roblox game stats:', message);
        return NextResponse.json({ error: 'Failed to fetch game stats', message }, { status: 500 });
    }
}
