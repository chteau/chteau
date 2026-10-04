import { NextResponse } from 'next/server';
import { castVote, getReactions, type Vote } from '../../../../lib/blogReactions';

/** A post's thumbs up/down counts (`?slug=...`), plus this visitor's own vote if `?fingerprint=...` is given. */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }
    const fingerprint = searchParams.get('fingerprint')?.trim() || undefined;
    const reactions = await getReactions(slug, fingerprint);
    return NextResponse.json(reactions, { headers: { 'Cache-Control': 'no-store' } });
}

/** Casts/flips/clears this visitor's vote — one vote per fingerprint, no sign-in required. */
export async function POST(request: Request) {
    let body: { slug?: string; fingerprint?: string; vote?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const slug = body.slug?.trim();
    const fingerprint = body.fingerprint?.trim();
    const vote = body.vote;

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }
    if (!fingerprint) {
        return NextResponse.json({ error: 'Missing visitor fingerprint.' }, { status: 400 });
    }
    if (vote !== 'up' && vote !== 'down') {
        return NextResponse.json({ error: 'Vote must be "up" or "down".' }, { status: 422 });
    }

    try {
        const reactions = await castVote(slug, fingerprint, vote as Vote);
        return NextResponse.json(reactions);
    } catch (err) {
        console.error('[blog/reactions] Failed to persist a vote:', err);
        return NextResponse.json({ error: 'Storage is unavailable right now — please try again shortly.' }, { status: 503 });
    }
}
