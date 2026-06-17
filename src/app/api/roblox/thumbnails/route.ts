import { NextRequest, NextResponse } from 'next/server';
import { robloxFetch } from '../utils';

/**
 * Returns the first completed thumbnail URL for each requested universe ID.
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
                universeId: number;
                thumbnails: { imageUrl: string; state: string }[];
            }[];
        }>(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeIdsParam}&countPerUniverse=1&defaults=true&size=768x432&format=Webp&isCircular=false`);

        const result: Record<string, string> = {};
        for (const game of data.data) {
            const thumb = game.thumbnails?.find(t => t.state === 'Completed');
            if (thumb) {
                result[game.universeId.toString()] = thumb.imageUrl;
            }
        }

        return NextResponse.json({ data: result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching Roblox thumbnails:', message);
        return NextResponse.json({ error: 'Failed to fetch thumbnails', message }, { status: 500 });
    }
}
