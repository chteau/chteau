import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth';
import { addComment, listComments } from '../../../lib/comments';
import { containsProfanity } from '../../../lib/profanity';

const BODY_LIMIT = 1000;

/** Comments for a given post (`?slug=...`), public. */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }
    const comments = await listComments(slug);
    return NextResponse.json({ comments });
}

/** Posts a new comment — requires a signed-in GitHub session; body is length-capped and profanity-checked. */
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'You must be signed in to comment.' }, { status: 401 });
    }

    let body: { slug?: string; body?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const slug = body.slug?.trim();
    const text = (body.body ?? '').trim();

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }
    if (!text || text.length > BODY_LIMIT) {
        return NextResponse.json({ error: `Comment must be 1-${BODY_LIMIT} characters.` }, { status: 422 });
    }
    if (containsProfanity(text)) {
        return NextResponse.json({ error: 'That comment was flagged by the content filter — please rephrase.' }, { status: 422 });
    }

    try {
        const comment = await addComment({
            slug,
            authorLogin: session.user.login ?? session.user.name ?? 'anonymous',
            authorName: session.user.name ?? session.user.login ?? 'Anonymous',
            authorAvatar: session.user.image ?? '',
            body: text,
        });
        return NextResponse.json({ comment }, { status: 201 });
    } catch (err) {
        console.error('[comments] Failed to persist a new comment:', err);
        return NextResponse.json({ error: 'Storage is unavailable right now — please try again shortly.' }, { status: 503 });
    }
}
