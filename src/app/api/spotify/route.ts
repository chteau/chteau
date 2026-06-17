import { NextResponse } from 'next/server';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

// Module-level token cache — persists across requests within the same serverless instance
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 10_000) {
        return cachedToken.value;
    }

    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        throw new Error('Missing Spotify env vars: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN');
    }

    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN,
        }).toString(),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Spotify token exchange failed (${res.status}): ${body}`);
    }

    const data = await res.json() as { access_token: string; expires_in: number };
    cachedToken = { value: data.access_token, expiresAt: now + data.expires_in * 1000 };
    return cachedToken.value;
}

export async function GET() {
    try {
        const token = await getAccessToken();

        const res = await fetch(NOW_PLAYING_URL, {
            headers: { Authorization: `Bearer ${token}` },
            // Always fetch fresh — widget polls on its own interval
            cache: 'no-store',
        });

        // 204 = Spotify player is idle / nothing queued
        if (res.status === 204) {
            return NextResponse.json({ isPlaying: false });
        }

        if (!res.ok) {
            return NextResponse.json({ isPlaying: false, error: `Spotify API error ${res.status}` });
        }

        const data = await res.json() as {
            is_playing: boolean;
            progress_ms: number;
            item: {
                name: string;
                duration_ms: number;
                artists: { name: string }[];
                album: { name: string; images: { url: string }[] };
                external_urls: { spotify: string };
            } | null;
        };

        if (!data.item) {
            return NextResponse.json({ isPlaying: false });
        }

        const { item } = data;
        return NextResponse.json({
            isPlaying: data.is_playing,
            track: {
                name: item.name,
                artist: item.artists.map(a => a.name).join(', '),
                album: item.album.name,
                // Prefer the smallest image (index 2 = 64px) for the widget thumbnail
                albumArt: item.album.images[2]?.url ?? item.album.images[0]?.url ?? null,
                duration: item.duration_ms,
                progress: data.progress_ms,
                url: item.external_urls.spotify,
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ isPlaying: false, error: message }, { status: 500 });
    }
}
